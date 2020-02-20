import * as Relay from 'graphql-relay'

/**
 * Augments PageInfo to add support for bi-directional pageinfo
 * (ie: having hasPreviousPage updated when paging forwards and vice versa)
 */
export function biDirectionalPageInfo<T=any>(
  connection: Relay.Connection<T>,
  meta: Relay.ArraySliceMetaInfo,
  returnedCount: number
): Relay.Connection<T> {
  // We're not the first element
  if (meta.sliceStart > 0) {
    connection.pageInfo.hasPreviousPage = true
  }

  // We have more elemnts
  if (1 + returnedCount + meta.sliceStart < meta.arrayLength) {
    connection.pageInfo.hasNextPage = true
  }

  return connection
}