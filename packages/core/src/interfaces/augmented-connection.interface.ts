import * as Relay from 'graphql-relay'

/**
 * Flow type of a `Relay.Connection` with edges that can possibly have some more data on them
 */
export interface AugmentedConnection<T=any, Y=any> extends Relay.Connection<T> {
  edges: AugmentedEdge<T, Y>[]
}

/**
 * Flow type of a `Relay.Edge` with optional additional properties on it
 */
export type AugmentedEdge<T=any, Y=any> = Relay.Edge<T> & Partial<Y>;
