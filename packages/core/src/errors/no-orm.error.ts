export class NoORMError extends Error {
  constructor() {
    super('No ORMConnection was found. Did you forget to init auto-relay ?')
  }
}