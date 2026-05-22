/**
 * Cleo bridge — the thin, confirm-gated CLI from a *resolved Spanish utterance*
 * to a *domain record* over the Payload local API.
 *
 * Spec: `.context/active/agents/sigma/we-expect/F-cleo-phase1-stock.md` (AC-2..AC-10)
 * Decision: `.context/active/agents/sigma/adrs/ADR-011-cleo-assistant.md` §5
 * Precedent: `scripts/seed-payload.ts` (`getPayload({ config })` local-API pattern).
 *
 * Architecture (Pillar 3 — one mutation-truth path):
 *   - The bridge writes ONLY domain records: `ventas.create` (a SELL),
 *     `modelos.update` of `variantes[i].stockTotal` (a PRODUCE),
 *     `telas.update` of `metrosComprados` (a RESTOCK-FABRIC).
 *   - It contains ZERO stock-column arithmetic. The existing Payload hooks own it:
 *       · `ventasStockSync` (afterChange Ventas) → +1 the variant's stockVendido,
 *         and THROWS "Variante … no encontrada" on an unknown varianteId.
 *       · `autoStock` (beforeChange Modelos) → recomputes `sinStock`.
 *     A correct/incorrect-but-valid write cannot corrupt the invariant — the hooks
 *     enforce it, the bridge merely feeds them domain records (AC-3).
 *
 * Safety (DATA-TRUTH, ADR-011 §5 — structural, not conventional):
 *   - `--dry-run` resolves + returns the would-be write WITHOUT writing (AC-4),
 *     and is DEFAULT-ON for prod-pointing invocations (see `resolveDryRun`).
 *   - `--confirm` is REQUIRED for any live write; absent it, a mutation verb
 *     refuses and returns the read-back instead (AC-5) — "no silent write" is a
 *     property of the bridge, not just a Cleo convention.
 *   - Required fields (compradora/precio/fechaVenta) are validated before any
 *     write; missing → a Spanish refusal naming the field (AC-6).
 *   - Every live mutation appends one line to an append-only audit log (AC-8).
 *   - The bridge NEVER reads/echoes the DB connection string — `getPayload`
 *     reads it from the environment internally (AC-10 + CREDENTIAL_HYGIENE).
 *
 * Testability (Pillar 7 — adapt, don't copy the precedent verbatim):
 *   The verbs take an INJECTED payload instance so tests can compose the real
 *   production hooks against an in-memory stub (the repo's established
 *   integration idiom — see `tests/integration/ventas-stock-decrement.test.ts`).
 *   The real `getPayload({ config })` is loaded LAZILY inside `main()`, so
 *   importing this module under jest never boots the heavy Payload runtime.
 */

import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Discriminated result returned by every verb (the `{ok, result|error}` contract). */
export type BridgeResult = { ok: true; result: unknown } | { ok: false; error: string };

/**
 * Minimal structural view of the Payload local API the bridge touches.
 * Explicit call signatures (NOT `Function`) per biome `noBannedTypes`.
 */
export interface BridgePayload {
  create(args: {
    collection: string;
    data: Record<string, unknown>;
  }): Promise<Record<string, unknown>>;
  update(args: {
    collection: string;
    id: string | number;
    data: Record<string, unknown>;
    depth?: number;
  }): Promise<Record<string, unknown>>;
  find(args: {
    collection: string;
    where?: Record<string, unknown>;
    limit?: number;
  }): Promise<{ docs: Array<Record<string, unknown>> }>;
  findByID(args: {
    collection: string;
    id: string | number;
    depth?: number;
  }): Promise<Record<string, unknown> | null>;
}

/** Options shared by every mutation verb. */
export interface MutationOpts {
  /** When true, resolve + return the would-be write but do NOT write (AC-4). */
  dryRun: boolean;
  /** When true, perform the live write; absent → refuse + return read-back (AC-5). */
  confirm: boolean;
  /** Audit-log destination; defaults to {@link DEFAULT_AUDIT_PATH} (AC-8). */
  auditPath?: string;
  /** Injectable clock for deterministic audit timestamps (test discipline). */
  now?: () => string;
}

export interface SellArgs {
  modeloId?: string | number;
  variante?: string;
  compradora?: string;
  precio?: number;
  fechaVenta?: string;
  estado?: string;
  contacto?: string;
  medioPago?: string;
  coleccion?: string | number;
  notas?: string;
}

export interface ProduceArgs {
  modeloId?: string | number;
  variante?: string;
  cantidad?: number;
}

export interface RestockFabricArgs {
  id?: string | number;
  codigo?: string;
  metros?: number;
}

export interface QueryArgs {
  collection?: string;
  where?: Record<string, unknown>;
  limit?: number;
  id?: string | number;
}

export interface RecadoArgs {
  mensaje?: string;
  de?: string;
  para?: string;
  estado?: string;
  prioridad?: string;
  creadoVia?: string;
  /** Optional polymorphic link to the record the recado is about. */
  relacion?: { relationTo: string; value: string | number } | string | number;
}

/** One append-only audit record (AC-8 / ADR-011 §5.3). */
export interface AuditEntry {
  tsISO: string;
  verb: string;
  resolvedArgs: Record<string, unknown>;
  confirmToken: boolean;
  result: BridgeResult;
}

type VarianteShape = {
  varianteId?: string | null;
  stockTotal?: number | null;
  [key: string]: unknown;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Append-only audit log (git-ignored operational substrate, NOT product data). */
export const DEFAULT_AUDIT_PATH = path.join(
  process.cwd(),
  '.context/active/agents/cleo/cleo-audit.log'
);

const defaultNow = (): string => new Date().toISOString();

// ---------------------------------------------------------------------------
// dry-run resolution (AC-4 — default-on for prod, WITHOUT reading the secret)
// ---------------------------------------------------------------------------

/**
 * Resolve whether a mutation runs in dry-run mode.
 *
 * AC-4 requires dry-run DEFAULT-ON for prod-pointing invocations. "Prod-pointing"
 * is decided by a COARSE target label (`CLEO_TARGET=prod` or
 * `NODE_ENV=production`) — NEVER by reading the DB connection string, so the
 * credential-hygiene invariant (AC-10) holds by construction.
 *
 * Precedence: explicit `--dry-run` forces on; explicit `--live` forces off;
 * otherwise default = prod-pointing.
 */
export function resolveDryRun(
  flags: { dryRun?: boolean; live?: boolean },
  env: { CLEO_TARGET?: string; NODE_ENV?: string }
): boolean {
  if (flags.dryRun === true) return true;
  if (flags.live === true) return false;
  return env.CLEO_TARGET === 'prod' || env.NODE_ENV === 'production';
}

// ---------------------------------------------------------------------------
// Audit log (AC-8)
// ---------------------------------------------------------------------------

/** Append exactly one JSON line per live mutation (success OR failure — forensic). */
export function appendAudit(auditPath: string, entry: AuditEntry): void {
  fs.mkdirSync(path.dirname(auditPath), { recursive: true });
  fs.appendFileSync(auditPath, `${JSON.stringify(entry)}\n`, 'utf8');
}

/**
 * The shared dry-run / confirm / audit gate for every mutation verb.
 * Resolution + validation happen in the verb BEFORE this is called.
 */
async function guardedMutation(
  verb: string,
  resolvedArgs: Record<string, unknown>,
  opts: MutationOpts,
  write: () => Promise<Record<string, unknown>>
): Promise<BridgeResult> {
  if (opts.dryRun) {
    return { ok: true, result: { status: 'dry-run', wouldWrite: resolvedArgs } };
  }
  if (!opts.confirm) {
    return { ok: true, result: { status: 'needs-confirm', readBack: resolvedArgs } };
  }

  let result: BridgeResult;
  try {
    const record = await write();
    result = { ok: true, result: { status: 'written', record } };
  } catch (err) {
    result = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  appendAudit(opts.auditPath ?? DEFAULT_AUDIT_PATH, {
    tsISO: (opts.now ?? defaultNow)(),
    verb,
    resolvedArgs,
    confirmToken: true,
    result,
  });
  return result;
}

// ---------------------------------------------------------------------------
// Verb: sell → ventas.create (AC-2, AC-3, AC-6, AC-7, AC-9)
// ---------------------------------------------------------------------------

/** Validate the SELL required-field gap (AC-6). Returns a Spanish error or null. */
export function validateSellArgs(args: SellArgs): string | null {
  if (!args.modeloId) return 'Falta el modelo de la venta. Decime qué prenda se vendió.';
  if (!args.variante) return 'Falta la variante (varianteId) de la venta.';
  if (!args.compradora || !String(args.compradora).trim()) {
    return 'Falta el campo requerido: compradora. ¿A quién se la vendiste?';
  }
  if (args.precio == null || Number.isNaN(Number(args.precio))) {
    return 'Falta el campo requerido: precio. ¿A cuánto la vendiste?';
  }
  if (Number(args.precio) < 0) return 'El campo precio no puede ser negativo.';
  if (!args.fechaVenta) {
    return 'Falta el campo requerido: fechaVenta. ¿Qué día fue la venta?';
  }
  return null;
}

export async function sell(
  payload: BridgePayload,
  args: SellArgs,
  opts: MutationOpts
): Promise<BridgeResult> {
  const missing = validateSellArgs(args);
  if (missing) return { ok: false, error: missing };

  const data: Record<string, unknown> = {
    compradora: args.compradora,
    modelo: args.modeloId,
    variante: args.variante,
    precio: args.precio,
    estado: args.estado ?? 'pendiente',
    fechaVenta: args.fechaVenta,
    ...(args.contacto ? { contacto: args.contacto } : {}),
    ...(args.medioPago ? { medioPago: args.medioPago } : {}),
    ...(args.coleccion ? { coleccion: args.coleccion } : {}),
    ...(args.notas ? { notas: args.notas } : {}),
  };

  return guardedMutation('sell', data, opts, () => payload.create({ collection: 'ventas', data }));
}

// ---------------------------------------------------------------------------
// Verb: produce → modelos.update variantes[i].stockTotal (AC-2, AC-3)
// ---------------------------------------------------------------------------

export async function produce(
  payload: BridgePayload,
  args: ProduceArgs,
  opts: MutationOpts
): Promise<BridgeResult> {
  if (!args.modeloId) return { ok: false, error: 'Falta el modelo a producir.' };
  if (!args.variante) return { ok: false, error: 'Falta la variante (varianteId) a producir.' };
  if (args.cantidad == null || Number.isNaN(Number(args.cantidad)) || Number(args.cantidad) <= 0) {
    return { ok: false, error: 'La cantidad a producir debe ser un número mayor a cero.' };
  }

  const modelo = (await payload.findByID({
    collection: 'modelos',
    id: args.modeloId,
    depth: 0,
  })) as { variantes?: VarianteShape[] } | null;
  if (!modelo) return { ok: false, error: `Modelo "${args.modeloId}" no encontrado.` };

  const variantes = Array.isArray(modelo.variantes) ? modelo.variantes : [];
  const cantidad = Number(args.cantidad);
  let found = false;
  // Spread preserves every other field (incl. the hook-owned stock columns).
  // The bridge names ONLY stockTotal — the production input it legitimately owns.
  const nextVariantes = variantes.map((v) => {
    if (v && v.varianteId === args.variante) {
      found = true;
      const current = typeof v.stockTotal === 'number' ? v.stockTotal : 0;
      return { ...v, stockTotal: current + cantidad };
    }
    return v;
  });
  if (!found) {
    return { ok: false, error: `Variante "${args.variante}" no encontrada en el modelo.` };
  }

  const resolvedArgs: Record<string, unknown> = {
    modeloId: args.modeloId,
    variante: args.variante,
    cantidad,
  };

  return guardedMutation('produce', resolvedArgs, opts, () =>
    payload.update({
      collection: 'modelos',
      id: args.modeloId as string | number,
      data: { variantes: nextVariantes },
      depth: 0,
    })
  );
}

// ---------------------------------------------------------------------------
// Verb: restock-fabric → telas.update metrosComprados (AC-2)
// ---------------------------------------------------------------------------

export async function restockFabric(
  payload: BridgePayload,
  args: RestockFabricArgs,
  opts: MutationOpts
): Promise<BridgeResult> {
  if (args.metros == null || Number.isNaN(Number(args.metros)) || Number(args.metros) <= 0) {
    return { ok: false, error: 'Los metros comprados deben ser un número mayor a cero.' };
  }

  let tela: Record<string, unknown> | null | undefined;
  if (args.id != null) {
    tela = await payload.findByID({ collection: 'telas', id: args.id });
  } else if (args.codigo) {
    const found = await payload.find({
      collection: 'telas',
      where: { codigo: { equals: args.codigo } },
      limit: 1,
    });
    tela = found?.docs?.[0];
  } else {
    return { ok: false, error: 'Falta identificar la tela (codigo o id).' };
  }

  const telaId = tela?.id as string | number | undefined;
  if (!tela || telaId == null) {
    return { ok: false, error: `Tela "${args.codigo ?? args.id}" no encontrada.` };
  }

  const metros = Number(args.metros);
  const current = typeof tela.metrosComprados === 'number' ? tela.metrosComprados : 0;
  const resolvedArgs: Record<string, unknown> = {
    telaId,
    codigo: tela.codigo,
    metros,
    nuevoMetrosComprados: current + metros,
  };

  return guardedMutation('restock-fabric', resolvedArgs, opts, () =>
    payload.update({ collection: 'telas', id: telaId, data: { metrosComprados: current + metros } })
  );
}

// ---------------------------------------------------------------------------
// Verb: query → read-only find / findByID (AC-2; no confirm/dry-run needed)
// ---------------------------------------------------------------------------

export async function query(payload: BridgePayload, args: QueryArgs): Promise<BridgeResult> {
  if (!args.collection) return { ok: false, error: 'Falta la colección a consultar.' };
  try {
    if (args.id != null) {
      const doc = await payload.findByID({ collection: args.collection, id: args.id });
      return { ok: true, result: doc };
    }
    const res = await payload.find({
      collection: args.collection,
      where: args.where,
      limit: args.limit ?? 25,
    });
    return { ok: true, result: res };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ---------------------------------------------------------------------------
// Verb: recado → recados.create (G-36 / O-17 §3 — the Daniela→equipo message)
// ---------------------------------------------------------------------------

/**
 * Validate the recado required-field gap. Returns a Spanish error or null.
 * A recado is low-stakes (a message, not stock) — the ONLY required field is the
 * message body itself. Everything else has a sensible default.
 */
export function validateRecadoArgs(args: RecadoArgs): string | null {
  if (!args.mensaje || !String(args.mensaje).trim()) {
    return 'Falta el mensaje del recado. ¿Qué le querés decir al equipo?';
  }
  return null;
}

/**
 * Write one recado through the same confirm / dry-run / audit gate the stock
 * verbs use (AC-3 + cascadeRationale: the stakes are low, but the write-path
 * discipline is kept for consistency). The READ side stays free via the generic
 * `query` verb (`{collection:'recados', where:{estado:{equals:'nuevo'}}}`) — no
 * new read code (O-17 §3.3).
 */
export async function recado(
  payload: BridgePayload,
  args: RecadoArgs,
  opts: MutationOpts
): Promise<BridgeResult> {
  const missing = validateRecadoArgs(args);
  if (missing) return { ok: false, error: missing };

  const data: Record<string, unknown> = {
    mensaje: args.mensaje,
    de: args.de ?? 'daniela',
    para: args.para ?? 'gabriel',
    estado: args.estado ?? 'nuevo',
    prioridad: args.prioridad ?? 'normal',
    creadoVia: args.creadoVia ?? 'cleo',
    ...(args.relacion ? { relacion: args.relacion } : {}),
  };

  return guardedMutation('recado', data, opts, () =>
    payload.create({ collection: 'recados', data })
  );
}

// ---------------------------------------------------------------------------
// CLI layer (lazy-loads the real Payload — never runs under jest)
// ---------------------------------------------------------------------------

interface CliFlags {
  json?: string;
  dryRun?: boolean;
  live?: boolean;
  confirm?: boolean;
  auditPath?: string;
}

export function parseFlags(argv: string[]): CliFlags {
  const flags: CliFlags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dry-run') flags.dryRun = true;
    else if (a === '--live') flags.live = true;
    else if (a === '--confirm') flags.confirm = true;
    else if (a === '--json') {
      flags.json = argv[i + 1];
      i += 1;
    } else if (a === '--audit-path') {
      flags.auditPath = argv[i + 1];
      i += 1;
    }
  }
  return flags;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const verb = argv[0];
  const flags = parseFlags(argv.slice(1));
  const dryRun = resolveDryRun({ dryRun: flags.dryRun, live: flags.live }, process.env);
  const opts: MutationOpts = {
    dryRun,
    confirm: flags.confirm === true,
    auditPath: flags.auditPath,
  };

  let parsedArgs: Record<string, unknown> = {};
  if (flags.json) {
    try {
      parsedArgs = JSON.parse(flags.json) as Record<string, unknown>;
    } catch (err) {
      process.stdout.write(
        `${JSON.stringify({ ok: false, error: `--json inválido: ${err instanceof Error ? err.message : String(err)}` })}\n`
      );
      process.exit(1);
    }
  }

  // Lazy import so jest (which mocks payload.config to `{}`) never boots the
  // heavy Payload runtime when this module is imported by a test.
  const { getPayload } = await import('payload');
  const { default: config } = await import('../src/payload/payload.config.ts');
  const payload = (await getPayload({ config })) as unknown as BridgePayload;

  let result: BridgeResult;
  switch (verb) {
    case 'sell':
      result = await sell(payload, parsedArgs as SellArgs, opts);
      break;
    case 'produce':
      result = await produce(payload, parsedArgs as ProduceArgs, opts);
      break;
    case 'restock-fabric':
      result = await restockFabric(payload, parsedArgs as RestockFabricArgs, opts);
      break;
    case 'query':
      result = await query(payload, parsedArgs as QueryArgs);
      break;
    case 'recado':
      result = await recado(payload, parsedArgs as RecadoArgs, opts);
      break;
    default:
      result = {
        ok: false,
        error: `Verbo desconocido: "${verb ?? ''}". Verbos: sell | produce | restock-fabric | query | recado.`,
      };
  }

  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exit(result.ok === false ? 1 : 0);
}

// Run as a CLI only when invoked directly (argv[1] is the script path). Under
// jest, argv[1] is the jest worker, so `main()` never fires on import.
if ((process.argv[1] ?? '').includes('cleo-bridge')) {
  main().catch((err) => {
    process.stderr.write(
      `${JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) })}\n`
    );
    process.exit(1);
  });
}
