/* eslint-disable @typescript-eslint/ban-types */
import { Service, Container } from 'typedi'
import { TypeValue } from '../types/types'
import { Field, ObjectType } from 'type-graphql'
import * as Relay from 'graphql-relay'

/**
 * Factory service for generating Objects that are dynamic and might be appened multiple times
 * to the SDL. Such as Edges and Connections
 */
@Service()
export class DynamicObjectFactory {
  /**
   * Creates and decorates two new Objects to connect two entities via Relay
   * Will return a relay Edge and Connection Object to be used when fetching this specific object
   * @param connectionName name of the connection, usually `EntitAEntityB`
   * @param nodeType type of the EntityB
   * @param edgeAugment if the relation is N:M, "augment" the edge with the join table
   */
  public makeEdgeConnection<T extends TypeValue> (
    connectionName: string,
    nodeType: () => T,
    edgeAugment?: () => new () => Object): { Connection: new () => Relay.Connection<T>; Edge: new () => Relay.Edge<T> } {
    if (!edgeAugment) edgeAugment = () => Object
    const PageInfo = this._getPageInfo()
    const Edge = this._makeEdge(connectionName, nodeType, edgeAugment)
    const Connection = this._makeConnection(connectionName, Edge, PageInfo)

    return { Edge, Connection }
  }

  /**
   * Create the Edge for the given node type & augment
   * @param connectionName name of the connection to prefix the edge
   * @param nodeType type of the node for this edge
   * @param edgeAugment optional type to augment the edge with
   */
  protected _makeEdge<T extends TypeValue> (connectionName: string, nodeType: () => T, edgeAugment: () => new () => any): new () => Relay.Edge<T> {
    const Edge = class extends edgeAugment().prototype.constructor implements Relay.Edge<T> {
      public node!: T;

      public cursor!: Relay.ConnectionCursor;
    }

    Object.assign(Edge, edgeAugment())

    Field(nodeType)(Edge.prototype, 'node')
    Field(() => String, { description: 'Used in `before` and `after` args' })(Edge.prototype, 'cursor')
    ObjectType(`${connectionName}Edge`)(Edge)

    return Edge
  }

  /**
   * Create the Connection object for the given Edge
   * @param connectionName name of the connection to prefix the object
   * @param Edge type of the edges we want to have in this connection
   * @param PageInfo type of the PageInfo we're using
   */
  protected _makeConnection<T extends TypeValue> (connectionName: string, Edge: new () => Relay.Edge<T>, PageInfo: new () => Relay.PageInfo): new () => Relay.Connection<T> {
    @ObjectType(`${connectionName}Connection`)
    class Connection implements Relay.Connection<T> {
        @Field(() => PageInfo)
      public pageInfo!: Relay.PageInfo;

        @Field(() => [Edge])
        public edges!: Relay.Edge<T>[];
    }

    return Connection
  }

  /**
   * Get the local PageInfo model
   * @throws if PageInfo cannot be accessed.
   */
  protected _getPageInfo (): new () => Relay.PageInfo {
    try {
      const PageInfoFn: () => (new () => Relay.PageInfo) = Container.get('PAGINATION_OBJECT')
      const PageInfo = PageInfoFn()

      if (!PageInfo) throw new Error()
      return PageInfo
    } catch (e) {
      throw new Error(`Couldn't find PageInfo Object. Did you forget to init TypeRelay?`)
    }
  }
}
