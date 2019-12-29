import { ClassValueThunk } from 'auto-relay'
import { GQLSortingGenerator } from '../graphql/graphql.generator'
import { Container } from 'typedi'

/**
 * Marks a 
 */
export function Sortable<Model=any>(
  model: ClassValueThunk<Model>
) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    process.nextTick(() => {

      Container.get(GQLSortingGenerator).generateForType(model(), target, propertyKey)

    })
  }
}