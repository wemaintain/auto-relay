import { createParamDecorator, ResolverData } from "type-graphql";
import { AutoRelayRoot } from "../interfaces/auto-relay-root-metadata.interface";

/**
 * Get the total number of items for the current paginated query/field
 * To be used exclusively when extending the PageInfo object
 */
export function RelayNbOfItems() {
  return createParamDecorator(RelayPaginationInner)
}

export function RelayPaginationInner(resolver: ResolverData<any>)  {
  if (resolver.root && resolver.root._autoRelayMetadata) {
    const root = resolver.root as AutoRelayRoot
    return root._autoRelayMetadata.totalItems
  }
}