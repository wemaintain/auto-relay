import * as Relay from 'graphql-relay'

/**
 * Flow type designed to extend `Relay.Connection` with edges that have data on them
 */
export interface AugmentedConnection<T=any, Y=any> extends Relay.Connection<T> {
  edges: AugmentedEdge<T, Y>[]
}

/**
 * Flow type of a `Relay.Edge` with optional additional properties on it
 */
// eslint-disable-next-line @typescript-eslint/no-type-alias
export type AugmentedEdge<T=any, Y=any> = Relay.Edge<T> & Record<Partial<keyof Y>, any>;
