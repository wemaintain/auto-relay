/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const base = require('./jest.config.base.js')

module.exports = {
  ...base,
  rootDir: './',
  roots: null,
  projects: [
    '<rootDir>/packages/**/jest.config.js',
  ],
  coverageDirectory: '<rootDir>/coverage/',
  setupFiles: ['<rootDir>/tests/setup.ts'],
  setupFilesAfterEnv: ['jest-extended'],
}
