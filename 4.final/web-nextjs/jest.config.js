const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './'
});

const customJestConfig = {
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@/domains/(.*)$': '<rootDir>/src/domains/$1',
    '^@/shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/(.*)$': '<rootDir>/$1'
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/__tests__/**',
    '!**/__mocks__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/__tests__/**/*.test.{js,jsx,ts,tsx}',
    '**/__tests__/**/*.spec.{js,jsx,ts,tsx}'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/coverage/'],
  // Enable parallel execution
  maxWorkers: '50%',
  // Speed up tests
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  // Reduce verbose output
  verbose: false,
  // Suppress console output during tests (can be overridden in tests if needed)
  silent: false
};

module.exports = createJestConfig(customJestConfig);
