/** No-op @next/env for use outside Next.js. Env loaded via --env-file. */
const noop = {
  loadEnvConfig: () => ({ loadedEnvFiles: [] }),
  processEnv: process.env,
  initialEnv: {},
  updateInitialEnv: () => {},
  resetEnv: () => {},
}
module.exports = noop
module.exports.default = noop
