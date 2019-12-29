/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const base = require('./jest.config.base.js')

module.exports = {
  ...base,
  rootDir: './',
  roots: null,
  projects: [
    '<rootDir>/packages/core/jest.config.js',
    '<rootDir>/packages/type-orm/jest.config.js',
    '<rootDir>/packages/sorting/jest.config.js',
    '<rootDir>/jest.integration.config.js',
  ],
  // coverageDirectory: '<rootDir>/coverage/',
  setupFiles: ['<rootDir>/tests/setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup-after-env.ts'],
}
