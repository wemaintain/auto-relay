import * as Relay from 'graphql-relay'

/**
 * Augments PageInfo to add support for bi-directional pageinfo
 * (ie: having hasPreviousPage updated when paging forwards and vice versa)
 */
export function biDirectionalPageInfo<T=any>(
  connection: Relay.Connection<T>,
  meta: Relay.ArraySliceMetaInfo,
  entityCount: number
): Relay.Connection<T> {

  // We're not the first element
  if (meta.sliceStart > 0) {
    connection.pageInfo.hasPreviousPage = true
  }

  // We have more elemnts
  if (meta.arrayLength + meta.sliceStart < entityCount) {
    connection.pageInfo.hasNextPage = true
  }

  return connection
}