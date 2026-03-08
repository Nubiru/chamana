/**
 * Patches @next/env for scripts that run outside Next.js.
 * Env vars are loaded via --env-file flag instead.
 * Use: node --require ./scripts/patch-next-env.cjs ...
 */
const Module = require('node:module');
const origResolve = Module._resolveFilename;

// Track whether we're resolving recursively
let patching = false;

Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === '@next/env' && !patching) {
    patching = true;
    try {
      return require.resolve('./next-env-noop.cjs');
    } finally {
      patching = false;
    }
  }
  return origResolve.call(this, request, parent, isMain, options);
};
