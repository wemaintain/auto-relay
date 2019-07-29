module.exports = {
  roots: [
    '<rootDir>/src',
    '<rootDir>/tests',
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
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '(tests/.*.mock).(jsx?|tsx?)$',
  ],
  setupFiles: ['../../tests/setup.ts'],
  setupFilesAfterEnv: ['jest-extended'],
  // verbose: true,
}
