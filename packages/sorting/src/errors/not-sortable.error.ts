import { ClassType } from 'type-graphql';

export class NotSortableError extends Error {
  constructor(target: ClassType, propertyKey: string) {
    super(`Tried getting order arg from a non sortable Query/FieldResolver ${target.name}.${propertyKey}. Did you forget to add @Sortable ?`)
  }
}