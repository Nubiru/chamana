/**
 * Unit — Cleo bridge required-field validation (AC-6 / ADR-011 §5.2).
 *
 * `ventas` requires compradora / precio / fechaVenta. A bare "vendí el pantalón
 * Magia" supplies none — the bridge MUST refuse with a Spanish error NAMING the
 * missing field (it never silently defaults; defaults belong to the Cleo
 * dialogue, shown in the read-back, then passed explicitly).
 */

import {
  type BridgePayload,
  type MutationOpts,
  sell,
  validateSellArgs,
} from '../../../scripts/cleo-bridge.ts';

const base = {
  modeloId: 'm1',
  variante: 'magia-linchoc',
  compradora: 'María',
  precio: 45000,
  fechaVenta: '2026-05-22',
};

function neverWritePayload(): BridgePayload {
  return {
    async create() {
      throw new Error('the bridge must NOT reach payload.create when a required field is missing');
    },
    async update() {
      throw new Error('unexpected update');
    },
    async find() {
      return { docs: [] };
    },
    async findByID() {
      return null;
    },
  };
}

describe('unit — cleo-bridge required fields (AC-6)', () => {
  it('refuses a missing compradora and names the field', async () => {
    const opts: MutationOpts = { dryRun: false, confirm: true };
    const res = await sell(neverWritePayload(), { ...base, compradora: undefined }, opts);
    expect(res.ok).toBe(false);
    expect((res as { ok: false; error: string }).error).toMatch(/compradora/);
  });

  it('refuses a blank compradora (whitespace only)', () => {
    expect(validateSellArgs({ ...base, compradora: '   ' })).toMatch(/compradora/);
  });

  it('names precio when missing, and fechaVenta when missing', () => {
    expect(validateSellArgs({ ...base, precio: undefined })).toMatch(/precio/);
    expect(validateSellArgs({ ...base, fechaVenta: undefined })).toMatch(/fechaVenta/);
  });

  it('names the modelo and the variante when missing', () => {
    expect(validateSellArgs({ ...base, modeloId: undefined })).toMatch(/modelo/i);
    expect(validateSellArgs({ ...base, variante: undefined })).toMatch(/variante/i);
  });

  it('accepts precio === 0 (falsy but valid) and rejects a negative precio', () => {
    expect(validateSellArgs({ ...base, precio: 0 })).toBeNull();
    expect(validateSellArgs({ ...base, precio: -1 })).toMatch(/precio/);
  });

  it('returns null (no error) when every required field is present', () => {
    expect(validateSellArgs(base)).toBeNull();
  });
});
