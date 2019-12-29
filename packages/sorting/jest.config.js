/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const base = require('../../jest.config.base.js')

module.exports = {
  ...base,
  roots: [
    './src',
    './tests',
  ],
  name: 'sorting',
  displayName: '@auto-relay/sorting',
}
