/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AugmentedConnection } from 'auto-relay'
import * as Relay from 'graphql-relay'
import cloneDeep from 'lodash.clonedeep'

/**
 * After having fetched a collection of Ys that are a JoinEntity linking to T,
 * return a Collection of Ts, with edges augmented with informations of Y
 * @param connection the connection object relay made us
 * @param throughKey key linking Y with T such that Y.throughKey = new T();
 */
export function augmentedConnection<T = unknown, Y = unknown> (
  connection: Relay.Connection<Y>,
  throughKey: string,
): AugmentedConnection<T, Y> {
  const newConnection: AugmentedConnection<T, Y> = cloneDeep(connection) as unknown as AugmentedConnection<T, Y>

  newConnection.edges = newConnection.edges.map((e) => {
    const newEdge = { ...e.node, ...e }
    newEdge.node = (e.node as unknown as Record<string, T>)[throughKey as string]

    return newEdge
  })

  return newConnection
}
