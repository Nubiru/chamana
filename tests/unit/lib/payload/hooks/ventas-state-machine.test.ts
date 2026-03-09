/**
 * Unit tests for lib/payload/hooks/ventas-state-machine.ts
 *
 * ventasStateMachine is a CollectionBeforeChangeHook that enforces
 * valid state transitions for the Ventas (sales) collection.
 */

import { ventasStateMachine } from '@/lib/payload/hooks/ventas-state-machine';

describe('ventasStateMachine hook', () => {
  // Helper to call the hook with minimal mock args
  function callHook(
    operation: 'create' | 'update',
    data: Record<string, unknown>,
    originalDoc?: Record<string, unknown>
  ) {
    return ventasStateMachine({
      data,
      originalDoc: originalDoc as any,
      operation,
      collection: {} as any,
      context: {} as any,
      req: {} as any,
    });
  }

  // ── Returns data unchanged on 'create' operation ──

  it('returns data unchanged on create operation', () => {
    const data = { estado: 'pendiente', items: [] };
    const result = callHook('create', data);
    expect(result).toEqual(data);
  });

  it('does not throw on create even with invalid state', () => {
    const data = { estado: 'entregada' };
    expect(() => callHook('create', data)).not.toThrow();
  });

  // ── Returns data unchanged when oldStatus equals newStatus ──

  it('returns data unchanged when status does not change', () => {
    const data = { estado: 'pendiente' };
    const result = callHook('update', data, { estado: 'pendiente' });
    expect(result).toEqual(data);
  });

  it('returns data unchanged when both statuses are pagada', () => {
    const data = { estado: 'pagada' };
    const result = callHook('update', data, { estado: 'pagada' });
    expect(result).toEqual(data);
  });

  // ── Returns data unchanged when oldStatus or newStatus is missing ──

  it('returns data unchanged when originalDoc has no estado', () => {
    const data = { estado: 'pagada' };
    const result = callHook('update', data, {});
    expect(result).toEqual(data);
  });

  it('returns data unchanged when data has no estado', () => {
    const data = { items: [] };
    const result = callHook('update', data, { estado: 'pendiente' });
    expect(result).toEqual(data);
  });

  it('returns data unchanged when originalDoc is undefined', () => {
    const data = { estado: 'pagada' };
    const result = callHook('update', data, undefined);
    expect(result).toEqual(data);
  });

  // ── Allows valid transitions ──

  it('allows pendiente -> pagada', () => {
    const data = { estado: 'pagada' };
    const result = callHook('update', data, { estado: 'pendiente' });
    expect(result.estado).toBe('pagada');
  });

  it('allows pendiente -> cancelada', () => {
    const data = { estado: 'cancelada' };
    const result = callHook('update', data, { estado: 'pendiente' });
    expect(result.estado).toBe('cancelada');
  });

  it('allows pagada -> enviada', () => {
    const data = { estado: 'enviada' };
    const result = callHook('update', data, { estado: 'pagada' });
    expect(result.estado).toBe('enviada');
  });

  it('allows pagada -> cancelada', () => {
    const data = { estado: 'cancelada' };
    const result = callHook('update', data, { estado: 'pagada' });
    expect(result.estado).toBe('cancelada');
  });

  it('allows enviada -> entregada', () => {
    const data = { estado: 'entregada' };
    const result = callHook('update', data, { estado: 'enviada' });
    expect(result.estado).toBe('entregada');
  });

  // ── Throws on invalid transitions ──

  it('throws on pendiente -> enviada (must go through pagada)', () => {
    expect(() => callHook('update', { estado: 'enviada' }, { estado: 'pendiente' })).toThrow();
  });

  it('throws on pendiente -> entregada', () => {
    expect(() => callHook('update', { estado: 'entregada' }, { estado: 'pendiente' })).toThrow();
  });

  it('throws on pagada -> entregada (must go through enviada)', () => {
    expect(() => callHook('update', { estado: 'entregada' }, { estado: 'pagada' })).toThrow();
  });

  it('throws on pagada -> pendiente (no going back)', () => {
    expect(() => callHook('update', { estado: 'pendiente' }, { estado: 'pagada' })).toThrow();
  });

  it('throws on enviada -> pagada (no going back)', () => {
    expect(() => callHook('update', { estado: 'pagada' }, { estado: 'enviada' })).toThrow();
  });

  it('throws on enviada -> cancelada (can only go to entregada)', () => {
    expect(() => callHook('update', { estado: 'cancelada' }, { estado: 'enviada' })).toThrow();
  });

  // ── Throws on terminal state transitions ──

  it('throws on entregada -> any state (terminal)', () => {
    expect(() => callHook('update', { estado: 'pendiente' }, { estado: 'entregada' })).toThrow();
    expect(() => callHook('update', { estado: 'pagada' }, { estado: 'entregada' })).toThrow();
    expect(() => callHook('update', { estado: 'enviada' }, { estado: 'entregada' })).toThrow();
    expect(() => callHook('update', { estado: 'cancelada' }, { estado: 'entregada' })).toThrow();
  });

  it('throws on cancelada -> any state (terminal)', () => {
    expect(() => callHook('update', { estado: 'pendiente' }, { estado: 'cancelada' })).toThrow();
    expect(() => callHook('update', { estado: 'pagada' }, { estado: 'cancelada' })).toThrow();
    expect(() => callHook('update', { estado: 'enviada' }, { estado: 'cancelada' })).toThrow();
    expect(() => callHook('update', { estado: 'entregada' }, { estado: 'cancelada' })).toThrow();
  });

  // ── Error message format ──

  it('throws error with Spanish message mentioning old and new status', () => {
    try {
      callHook('update', { estado: 'enviada' }, { estado: 'pendiente' });
      fail('should have thrown');
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain('No se puede cambiar el estado');
      expect(message).toContain('"pendiente"');
      expect(message).toContain('"enviada"');
    }
  });

  it('error message lists allowed transitions when they exist', () => {
    try {
      callHook('update', { estado: 'enviada' }, { estado: 'pendiente' });
      fail('should have thrown');
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain('Transiciones permitidas:');
      expect(message).toContain('pagada');
      expect(message).toContain('cancelada');
    }
  });

  it('error message says "ninguna (estado final)" for terminal states', () => {
    try {
      callHook('update', { estado: 'pendiente' }, { estado: 'entregada' });
      fail('should have thrown');
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain('ninguna (estado final)');
    }
  });

  it('error message for cancelada terminal state', () => {
    try {
      callHook('update', { estado: 'pendiente' }, { estado: 'cancelada' });
      fail('should have thrown');
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain('ninguna (estado final)');
    }
  });

  // ── Unknown old status falls through to empty allowed array ──

  it('throws on unknown old status transitioning to any state', () => {
    expect(() => callHook('update', { estado: 'pagada' }, { estado: 'unknown-status' })).toThrow();
  });

  // ── Auto-sets fechaEnvio when transitioning to enviada ──

  it('auto-sets fechaEnvio when transitioning to enviada without existing fechaEnvio', () => {
    const beforeDate = new Date().toISOString();
    const data = { estado: 'enviada' };
    const result = callHook('update', data, { estado: 'pagada' });
    const afterDate = new Date().toISOString();

    expect(result.fechaEnvio).toBeDefined();
    expect(typeof result.fechaEnvio).toBe('string');
    // Verify it's a valid ISO date string within the test execution window
    expect(result.fechaEnvio >= beforeDate).toBe(true);
    expect(result.fechaEnvio <= afterDate).toBe(true);
  });

  it('does NOT overwrite existing fechaEnvio', () => {
    const existingDate = '2026-01-15T10:00:00.000Z';
    const data = { estado: 'enviada', fechaEnvio: existingDate };
    const result = callHook('update', data, { estado: 'pagada' });
    expect(result.fechaEnvio).toBe(existingDate);
  });

  it('does not set fechaEnvio for non-enviada transitions', () => {
    const data = { estado: 'pagada' };
    const result = callHook('update', data, { estado: 'pendiente' });
    expect(result.fechaEnvio).toBeUndefined();
  });

  it('does not set fechaEnvio for cancelada transition', () => {
    const data = { estado: 'cancelada' };
    const result = callHook('update', data, { estado: 'pendiente' });
    expect(result.fechaEnvio).toBeUndefined();
  });
});
