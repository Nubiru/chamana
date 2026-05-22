/**
 * Unit — Cleo bridge `recado` write verb (G-36 / O-17 §3) + Recados collection
 * shape guard.
 *
 * The recado verb is the ONLY genuinely-new code for the Daniela→equipo message
 * path (O-17 §3.2): the read side is already free via the generic `query` verb.
 * It is low-stakes (a message, not stock) but keeps the full
 * confirm / dry-run / audit write-path discipline for consistency
 * (AC-3 + cascadeRationale). These tests prove the {ok, result|error} contract +
 * confirm/dry-run gating + the required `mensaje`; the collection-shape guard
 * prevents field drift (the consume path queries `estado=nuevo`, so estado must
 * stay an indexed select with those values).
 */

import os from 'node:os';
import path from 'node:path';
import { Recados } from '@/payload/collections/Recados';
import type { Field, SelectField } from 'payload';
import {
  type BridgePayload,
  type BridgeResult,
  type MutationOpts,
  recado,
} from '../../../scripts/cleo-bridge.ts';

interface CreateSpy {
  payload: BridgePayload;
  calls: { create: number; last?: { collection: string; data: Record<string, unknown> } };
}

function spyPayload(): CreateSpy {
  const calls: CreateSpy['calls'] = { create: 0 };
  const payload: BridgePayload = {
    async create({ collection, data }) {
      calls.create += 1;
      calls.last = { collection, data };
      return { id: 1, ...data };
    },
    async update({ id, data }) {
      return { id, ...data };
    },
    async find() {
      return { docs: [] };
    },
    async findByID() {
      return null;
    },
  };
  return { payload, calls };
}

function tmpAudit(): string {
  return path.join(
    os.tmpdir(),
    `cleo-audit-recado-${Date.now()}-${Math.random().toString(36).slice(2)}.log`
  );
}

function okResult(res: BridgeResult): Record<string, unknown> {
  expect(res.ok).toBe(true);
  return (res as { ok: true; result: Record<string, unknown> }).result;
}

function findField(name: string): Field | undefined {
  return (Recados.fields as Field[]).find(
    (f): f is Field & { name?: string } =>
      typeof (f as { name?: unknown }).name === 'string' && (f as { name: string }).name === name
  );
}

describe('unit — cleo-bridge recado verb (G-36 / AC-3)', () => {
  it('writes a recado to the recados collection on a confirmed live write', async () => {
    const { payload, calls } = spyPayload();
    const opts: MutationOpts = { dryRun: false, confirm: true, auditPath: tmpAudit() };

    const result = okResult(
      await recado(
        payload,
        { mensaje: 'Decile a Gabriel que el modelo Intuicion tiene mal la foto' },
        opts
      )
    );
    expect(result.status).toBe('written');
    expect(calls.create).toBe(1);
    expect(calls.last?.collection).toBe('recados');
    expect((calls.last?.data as Record<string, unknown>).mensaje).toMatch(/Intuicion/);
  });

  it('applies sensible defaults when Cleo only supplies the message', async () => {
    const { payload, calls } = spyPayload();

    await recado(
      payload,
      { mensaje: 'Necesito un talle nuevo' },
      {
        dryRun: false,
        confirm: true,
        auditPath: tmpAudit(),
      }
    );

    const data = calls.last?.data as Record<string, unknown>;
    expect(data.de).toBe('daniela');
    expect(data.para).toBe('gabriel');
    expect(data.estado).toBe('nuevo');
    expect(data.creadoVia).toBe('cleo');
  });

  it('respects explicit overrides for de/para/prioridad', async () => {
    const { payload, calls } = spyPayload();

    await recado(
      payload,
      { mensaje: 'Idea para la coleccion', de: 'daniela', para: 'equipo', prioridad: 'alta' },
      { dryRun: false, confirm: true, auditPath: tmpAudit() }
    );

    const data = calls.last?.data as Record<string, unknown>;
    expect(data.para).toBe('equipo');
    expect(data.prioridad).toBe('alta');
  });

  it('dry-run resolves the would-be write but does NOT write', async () => {
    const { payload, calls } = spyPayload();

    const result = okResult(
      await recado(payload, { mensaje: 'Hola' }, { dryRun: true, confirm: true })
    );
    expect(result.status).toBe('dry-run');
    expect((result.wouldWrite as Record<string, unknown>).mensaje).toBe('Hola');
    expect(calls.create).toBe(0);
  });

  it('without --confirm, recado refuses and returns a read-back (no write)', async () => {
    const { payload, calls } = spyPayload();

    const result = okResult(
      await recado(payload, { mensaje: 'Hola' }, { dryRun: false, confirm: false })
    );
    expect(result.status).toBe('needs-confirm');
    expect((result.readBack as Record<string, unknown>).mensaje).toBe('Hola');
    expect(calls.create).toBe(0);
  });

  it('refuses a recado with no mensaje (Spanish error names the field)', async () => {
    const { payload, calls } = spyPayload();

    const res = await recado(payload, {}, { dryRun: false, confirm: true, auditPath: tmpAudit() });
    expect(res.ok).toBe(false);
    expect((res as { ok: false; error: string }).error).toMatch(/mensaje/i);
    expect(calls.create).toBe(0);
  });

  it('refuses a blank / whitespace-only mensaje', async () => {
    const { payload, calls } = spyPayload();

    const res = await recado(
      payload,
      { mensaje: '   ' },
      {
        dryRun: false,
        confirm: true,
        auditPath: tmpAudit(),
      }
    );
    expect(res.ok).toBe(false);
    expect(calls.create).toBe(0);
  });
});

describe('Recados collection — shape guard (G-36 / consume path)', () => {
  it('has slug "recados" (the bridge writes + the query verb reads this)', () => {
    expect(Recados.slug).toBe('recados');
  });

  it('mensaje is a required textarea (the message body)', () => {
    const mensaje = findField('mensaje');
    expect(mensaje?.type).toBe('textarea');
    expect((mensaje as { required?: boolean } | undefined)?.required).toBe(true);
  });

  it('estado is an indexed select [nuevo, visto, resuelto] defaulting to nuevo', () => {
    const estado = findField('estado') as SelectField | undefined;
    expect(estado?.type).toBe('select');
    expect(estado?.defaultValue).toBe('nuevo');
    expect(estado?.index).toBe(true);
    expect((estado?.options as Array<{ value: string }>).map((o) => o.value)).toEqual([
      'nuevo',
      'visto',
      'resuelto',
    ]);
  });

  it('de + para selects exist with sensible defaults', () => {
    expect((findField('de') as SelectField | undefined)?.defaultValue).toBe('daniela');
    expect((findField('para') as SelectField | undefined)?.defaultValue).toBe('gabriel');
  });

  it('keeps the message box in the main panel; meta in the sidebar (simple for Daniela)', () => {
    const mensaje = findField('mensaje') as { admin?: { position?: string } } | undefined;
    const estado = findField('estado') as SelectField | undefined;
    expect(mensaje?.admin?.position).toBeUndefined();
    expect(estado?.admin?.position).toBe('sidebar');
  });

  it('useAsTitle is mensaje + defaultColumns surfaces estado', () => {
    expect(Recados.admin?.useAsTitle).toBe('mensaje');
    expect(Recados.admin?.defaultColumns).toContain('estado');
  });
});
