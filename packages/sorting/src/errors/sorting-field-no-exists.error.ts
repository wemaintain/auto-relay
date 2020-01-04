import { OrderingValue } from './../graphql/ordering.input'
import { ClassType } from 'type-graphql';

export class SortingFieldDoesntExistError extends Error {
  constructor(sortingField: OrderingValue, target: ClassType, propertyKey: string) {
    super(`Couldn't find sorting field ${sortingField.sort} in ${target.name}.${propertyKey}`)
  }
}