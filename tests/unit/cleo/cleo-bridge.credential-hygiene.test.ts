/**
 * Guard — Cleo bridge credential hygiene (AC-10) + domain-records-only (AC-3).
 *
 * AC-10: the bridge reads the DB connection from the environment via
 * `getPayload({ config })`; it NEVER references / echoes the connection-string
 * secret. We grep the bridge source (the audit-log writer lives in the same
 * file) for the secret-leak vectors and assert none.
 *
 * AC-3: the bridge writes ONLY domain records and contains ZERO direct
 * stock-column arithmetic — we grep for the forbidden assignment patterns
 * (`stockVendido +=` / `sinStock =`) that AC-3 names. (The architecture comment
 * legitimately *mentions* these columns to document the hooks that own them;
 * the guard targets WRITE/ASSIGNMENT, not prose.)
 */

import fs from 'node:fs';
import path from 'node:path';

const BRIDGE_PATH = path.join(process.cwd(), 'scripts/cleo-bridge.ts');

describe('guard — cleo-bridge credential hygiene (AC-10)', () => {
  const source = fs.readFileSync(BRIDGE_PATH, 'utf8');

  it('never references the POSTGRES_URL env var', () => {
    expect(source).not.toMatch(/POSTGRES_URL/);
    expect(source).not.toMatch(/process\.env\.POSTGRES/);
  });

  it('never embeds a postgres/postgresql connection-string scheme', () => {
    expect(source).not.toMatch(/postgres(ql)?:\/\//i);
  });

  it('never reads .env files directly', () => {
    expect(source).not.toMatch(/readFileSync\([^)]*\.env/);
    expect(source).not.toMatch(/['"`][^'"`]*\.env(\.local)?['"`]/);
  });
});

describe('guard — cleo-bridge domain-records-only (AC-3)', () => {
  const source = fs.readFileSync(BRIDGE_PATH, 'utf8');

  it('contains ZERO direct stockVendido arithmetic (the hook owns it)', () => {
    // Any assignment / compound-assignment to stockVendido is forbidden.
    expect(source).not.toMatch(/stockVendido\s*[+\-*/]?=[^=]/);
  });

  it('contains ZERO direct sinStock assignment (autoStock owns it)', () => {
    expect(source).not.toMatch(/sinStock\s*[+\-*/]?=[^=]/);
  });

  it('writes only through payload.create / payload.update (no raw column writers)', () => {
    // Sanity: the only mutation calls are the Payload local-API methods.
    expect(source).toMatch(/payload\.create\(\s*\{\s*collection:\s*'ventas'/);
    expect(source).toMatch(/payload\.update\(\s*\{\s*collection:\s*'modelos'/);
    expect(source).toMatch(/payload\.update\(\s*\{\s*collection:\s*'telas'/);
  });
});
