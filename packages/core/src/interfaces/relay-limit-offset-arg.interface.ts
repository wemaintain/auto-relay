import * as Relay from 'graphql-relay'

/**
 * Pagination argument sanitized and transformed to Limit/Offset pattern
 */
export interface RelayLimitOffsetArgs {
  limit?: number
  offset?: number
  _originalArgs: Relay.ConnectionArguments
}