import { ClassValueThunk } from 'auto-relay'
import { GQLSortingGenerator } from '../graphql/graphql.generator'
import { Container } from 'typedi'

/**
 * Marks a query or field resolver or mutation as Sortable,
 * Adding an `order` arg on it waiting for an array of columns / directions to be sorted
 */
export function Sortable<Model=any>(
  model: ClassValueThunk<Model>
) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(AUTORELAY_SORTABLE_ARG_NAME, "order", target, propertyKey)
    process.nextTick(() => {
      Reflect.defineMetadata(AUTORELAY_SORTABLE_ARG_OBJECT, model(), target, propertyKey)
      Container.get(GQLSortingGenerator).generateForType(model(), target, propertyKey)
    })
  }
}

export const AUTORELAY_SORTABLE_ARG_NAME = Symbol(`Name of the argument in the sdl containing the order data`)
export const AUTORELAY_SORTABLE_ARG_OBJECT = Symbol(`Object in the sdl containing for which the fields are being sorted`)