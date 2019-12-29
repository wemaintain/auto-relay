const { pathsToModuleNameMapper } = require('ts-jest/utils');
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  roots: [
    './src',
    './tests',
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
      tsConfig: '<rootDir>/tsconfig.specs.json'
    }
  },
  collectCoverage: true,
  // collectCoverageFrom: [
  //   './src/**/*.ts',
  // ],
  coveragePathIgnorePatterns: [
    '(tests/.*.mock).(jsx?|tsx?)$',
    '(index.ts)$',
  ],
  setupFiles: ['reflect-metadata'],
  setupFilesAfterEnv: ['jest-extended'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix: __dirname + '/packages/'}),
  // verbose: true,
}
