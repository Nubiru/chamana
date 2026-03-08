/** No-op @next/env for use outside Next.js. Env loaded via --env-file. */
const noop = {
  loadEnvConfig: () => ({ loadedEnvFiles: [] }),
  processEnv: process.env,
  initialEnv: {},
  updateInitialEnv: () => {
    /* noop */
  },
  resetEnv: () => {
    /* noop */
  },
};
module.exports = noop;
module.exports.default = noop;
