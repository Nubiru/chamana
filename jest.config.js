const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './'
});

const customJestConfig = {
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@payload-config$': '<rootDir>/tests/__mocks__/payload-config.ts',
    '^.*/payload\\.config(\\.ts)?$': '<rootDir>/tests/__mocks__/payload-config.ts',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@/payload/(.*)$': '<rootDir>/src/payload/$1',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**'
  ],
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.spec.{js,jsx,ts,tsx}'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/coverage/', '/tests/e2e/'],
  passWithNoTests: true,
  maxWorkers: '50%',
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  verbose: false,
  silent: false
};

module.exports = createJestConfig(customJestConfig);
