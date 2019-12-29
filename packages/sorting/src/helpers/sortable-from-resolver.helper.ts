import { NotSortableError } from './../errors/not-sortable.error';
import { AUTORELAY_ENUM_REVERSE_MAP, SortableField } from './../graphql/graphql.generator';
import { ResolverData, ClassType } from 'type-graphql'
import { OrderingDirection, OrderingValue } from '../graphql/ordering.input'
import { SortingFieldDoesntExistError } from '../errors/sorting-field-no-exists.error';

/**
 * Returns all the sorting fields being used in a given query/field resolver
 * 
 * @param resolverData data we got from GraphQL
 * @param target class of the resolver we were declared in
 * @param propertyKey propertykey of the method in the resolver
 */
export function getSortablesFromResolverData(
  resolverData: ResolverData<any>,
  target: ClassType,
  propertyKey: string,
): SortingField[] {
  const map: SortableField[] = Reflect.getMetadata(AUTORELAY_ENUM_REVERSE_MAP, target, propertyKey)
  if (!map) throw new NotSortableError(target, propertyKey)

  const suppliedOrder: OrderingValue[] = resolverData.args.order
  if (!suppliedOrder?.length) return []

  const sortingFields: SortingField[] = suppliedOrder.map((orderingValue) => {
    const sortable = map.find((s) => s.schemaName === orderingValue.sort)
    if (!sortable) throw new SortingFieldDoesntExistError(orderingValue, target, propertyKey)
    return {
      ...sortable,
      direction: orderingValue.direction ?? OrderingDirection.ASC
    }
  })

  return sortingFields
}


export interface SortingField {
  /** name of the property in the class */
  name: string,
  /** public name exposed in the schema */
  schemaName: string
  /** direction to sort by */
  direction: OrderingDirection
  /** type on which this field exists */
  type: ClassType
}