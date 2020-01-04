const base = require('./jest.config.base.js')
// jest.config.js
const { pathsToModuleNameMapper } = require('ts-jest/utils');
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  roots: [
    'tests',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: '(.*\\.(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
  ],
  globals: {
    'ts-jest': {
      tsCofnfig: './tsconfig.integration.json'
    }
  },
  setupFiles: ['reflect-metadata'],
  setupFilesAfterEnv: ['jest-extended'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/packages/'}),
  name: 'integration',
  displayName: 'integration',
}
