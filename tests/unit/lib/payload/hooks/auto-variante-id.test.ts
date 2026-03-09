/**
 * Unit tests for lib/payload/hooks/auto-variante-id.ts
 *
 * autoVarianteId is an async FieldHook that generates a variante ID
 * by looking up tela codes via req.payload.findByID.
 */

import { autoVarianteId } from '@/lib/payload/hooks/auto-variante-id';

describe('autoVarianteId hook', () => {
  // Helper to build mock req with payload.findByID
  function mockReq(findByIDImpl?: (args: { collection: string; id: unknown }) => unknown) {
    return {
      payload: {
        findByID: jest.fn(findByIDImpl || (() => ({}))),
      },
    };
  }

  // Helper to call the hook with mock args
  async function callHook(
    value: unknown,
    siblingData: Record<string, unknown> | undefined,
    req: ReturnType<typeof mockReq>
  ) {
    return (autoVarianteId as (args: Record<string, unknown>) => unknown)({
      value,
      siblingData,
      req,
    });
  }

  // ── Returns existing value when truthy ──

  it('returns existing value when value is a non-empty string', async () => {
    const req = mockReq();
    const result = await callHook('existing-id', { tela1: 'abc' }, req);
    expect(result).toBe('existing-id');
    expect(req.payload.findByID).not.toHaveBeenCalled();
  });

  it('returns existing value when value is truthy (number)', async () => {
    const req = mockReq();
    const result = await callHook(42, { tela1: 'abc' }, req);
    expect(result).toBe(42);
  });

  // ── Returns value when tela1 is missing ──

  it('returns value (undefined) when tela1 is undefined', async () => {
    const req = mockReq();
    const result = await callHook(undefined, { tela2: 'something' }, req);
    expect(result).toBeUndefined();
    expect(req.payload.findByID).not.toHaveBeenCalled();
  });

  it('returns value when tela1 is null', async () => {
    const req = mockReq();
    const result = await callHook(undefined, { tela1: null }, req);
    expect(result).toBeUndefined();
  });

  it('returns value when tela1 is empty string', async () => {
    const req = mockReq();
    const result = await callHook(undefined, { tela1: '' }, req);
    expect(result).toBeUndefined();
  });

  it('returns value when siblingData is undefined', async () => {
    const req = mockReq();
    const result = await callHook(undefined, undefined, req);
    expect(result).toBeUndefined();
  });

  // ── Single tela: generates "{modelSlug}-{tela1code}" ──

  it('generates id with modelSlug and tela1 code for single tela', async () => {
    const req = mockReq(() => ({ codigo: 'LinSpanBei' }));
    const result = await callHook(
      undefined,
      {
        tela1: 'tela1-id',
        _parentSlug: 'intuicion',
      },
      req
    );
    expect(result).toBe('intuicion-linspanbei');
  });

  it('calls findByID with correct collection and id for tela1', async () => {
    const req = mockReq(() => ({ codigo: 'ABC' }));
    await callHook(
      undefined,
      {
        tela1: 'tela-123',
        _parentSlug: 'sabia',
      },
      req
    );
    expect(req.payload.findByID).toHaveBeenCalledWith({
      collection: 'telas',
      id: 'tela-123',
    });
  });

  // ── Two telas: generates "{modelSlug}-{tela1code}-{tela2code}" ──

  it('generates id with both tela codes for reversible (two telas)', async () => {
    const req = mockReq(({ id }: { id: unknown }) => {
      if (id === 'tela1-id') return { codigo: 'LinSpanBei' };
      if (id === 'tela2-id') return { codigo: 'RibNegro' };
      return {};
    });
    const result = await callHook(
      undefined,
      {
        tela1: 'tela1-id',
        tela2: 'tela2-id',
        _parentSlug: 'espejo',
      },
      req
    );
    expect(result).toBe('espejo-linspanbei-ribnegro');
  });

  it('calls findByID twice when tela2 is present', async () => {
    const req = mockReq(() => ({ codigo: 'X' }));
    await callHook(
      undefined,
      {
        tela1: 'id1',
        tela2: 'id2',
        _parentSlug: 'test',
      },
      req
    );
    expect(req.payload.findByID).toHaveBeenCalledTimes(2);
    expect(req.payload.findByID).toHaveBeenCalledWith({ collection: 'telas', id: 'id1' });
    expect(req.payload.findByID).toHaveBeenCalledWith({ collection: 'telas', id: 'id2' });
  });

  it('does not call findByID for tela2 when tela2 is falsy', async () => {
    const req = mockReq(() => ({ codigo: 'ABC' }));
    await callHook(
      undefined,
      {
        tela1: 'id1',
        tela2: null,
        _parentSlug: 'test',
      },
      req
    );
    expect(req.payload.findByID).toHaveBeenCalledTimes(1);
  });

  // ── Default modelSlug when _parentSlug is missing ──

  it('uses "model" as default when _parentSlug is missing', async () => {
    const req = mockReq(() => ({ codigo: 'LinSpanBei' }));
    const result = await callHook(
      undefined,
      {
        tela1: 'tela1-id',
      },
      req
    );
    expect(result).toBe('model-linspanbei');
  });

  it('uses "model" as default when _parentSlug is undefined', async () => {
    const req = mockReq(() => ({ codigo: 'ABC' }));
    const result = await callHook(
      undefined,
      {
        tela1: 'tela1-id',
        _parentSlug: undefined,
      },
      req
    );
    expect(result).toBe('model-abc');
  });

  // ── Uses "unknown" when tela codigo is missing ──

  it('uses "unknown" when tela1 has no codigo', async () => {
    const req = mockReq(() => ({}));
    const result = await callHook(
      undefined,
      {
        tela1: 'tela1-id',
        _parentSlug: 'intuicion',
      },
      req
    );
    expect(result).toBe('intuicion-unknown');
  });

  it('uses "unknown" when tela1 codigo is null', async () => {
    const req = mockReq(() => ({ codigo: null }));
    const result = await callHook(
      undefined,
      {
        tela1: 'tela1-id',
        _parentSlug: 'intuicion',
      },
      req
    );
    expect(result).toBe('intuicion-unknown');
  });

  it('uses "unknown" when tela2 has no codigo', async () => {
    const req = mockReq(({ id }: { id: unknown }) => {
      if (id === 'tela1-id') return { codigo: 'LinSpanBei' };
      return {}; // tela2 has no codigo
    });
    const result = await callHook(
      undefined,
      {
        tela1: 'tela1-id',
        tela2: 'tela2-id',
        _parentSlug: 'espejo',
      },
      req
    );
    expect(result).toBe('espejo-linspanbei-unknown');
  });

  // ── Lowercases tela codes ──

  it('lowercases tela1 codigo', async () => {
    const req = mockReq(() => ({ codigo: 'LinSpanBei' }));
    const result = await callHook(
      undefined,
      {
        tela1: 'tela1-id',
        _parentSlug: 'test',
      },
      req
    );
    expect(result).toBe('test-linspanbei');
  });

  it('lowercases both tela codes in reversible', async () => {
    const req = mockReq(({ id }: { id: unknown }) => {
      if (id === 'id1') return { codigo: 'ABC' };
      if (id === 'id2') return { codigo: 'XYZ' };
      return {};
    });
    const result = await callHook(
      undefined,
      {
        tela1: 'id1',
        tela2: 'id2',
        _parentSlug: 'test',
      },
      req
    );
    expect(result).toBe('test-abc-xyz');
  });

  // ── Returns value on findByID error (catch block) ──

  it('returns original value (undefined) when findByID throws', async () => {
    const req = mockReq(() => {
      throw new Error('Database connection failed');
    });
    const result = await callHook(
      undefined,
      {
        tela1: 'tela1-id',
        _parentSlug: 'intuicion',
      },
      req
    );
    expect(result).toBeUndefined();
  });

  it('returns original value (null) when findByID rejects', async () => {
    const req = {
      payload: {
        findByID: jest.fn().mockRejectedValue(new Error('Not found')),
      },
    };
    const result = await callHook(
      null,
      {
        tela1: 'tela1-id',
        _parentSlug: 'intuicion',
      },
      req
    );
    expect(result).toBeNull();
  });

  it('catches error when second findByID (tela2) fails', async () => {
    let callCount = 0;
    const req = {
      payload: {
        findByID: jest.fn(() => {
          callCount++;
          if (callCount === 1) return Promise.resolve({ codigo: 'LinSpanBei' });
          return Promise.reject(new Error('tela2 not found'));
        }),
      },
    };
    const result = await callHook(
      undefined,
      {
        tela1: 'id1',
        tela2: 'id2',
        _parentSlug: 'espejo',
      },
      req
    );
    // The whole try block fails, so we get the original value
    expect(result).toBeUndefined();
  });
});
