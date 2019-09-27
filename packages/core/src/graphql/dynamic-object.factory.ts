import { AutoRelayConfig } from './../services/auto-relay-config.service';
import { RelayedConnectionOptions } from './../decorators/relayed-connection.decorator';
import { Service, Container } from 'typedi'
import { TypeValue } from '../types/types'
import { Field, ObjectType, Arg } from 'type-graphql'
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
  public makeEdgeConnection<T extends TypeValue>(
    connectionName: string,
    nodeType: () => T,
    edgeAugment?: () => new () => Object,
    options?: RelayedConnectionOptions,
  ): { Connection: new () => Relay.Connection<T>; Edge: new () => Relay.Edge<T> } {
    if (!edgeAugment) edgeAugment = () => Object
    const PageInfo = this.getPageInfo()

    const Edge = this.makeEdge(connectionName, nodeType, edgeAugment)
    const Connection = this.makeConnection(connectionName, Edge, PageInfo, options)

    return { Edge, Connection }
  }

  /**
   * Mark a given function
   * @param target target object on which the function exists (this must be a Type-graphql decoarted class)
   * @param functionName name of the function on the target object
   * @param sdlName name to give to this function in the SDL
   * @param Connection Connection object returned by the function
   */
  public declareFunctionAsRelayInSDL<T extends TypeValue>(
    target: any,
    functionName: string,
    sdlName: string | symbol,
    Connection: new () => Relay.Connection<T>,
    options?: RelayedConnectionOptions,
  ): void {
    const fieldOptions = options && options.field
    // Ignore the undefined options as it is the edge that needs to be nullable,
    // Not ourself
    if (fieldOptions && fieldOptions.nullable) fieldOptions.nullable = undefined

    // And we ensure our target[getterName] is recognized by GQL under target{}
    Reflect.defineMetadata('design:paramtypes', [String, Number, String, Number], target, functionName)
    Arg('after', () => String, { nullable: true })(target, functionName, 0)
    Arg('first', () => Number, { nullable: true })(target, functionName, 1)
    Arg('before', () => String, { nullable: true })(target, functionName, 2)
    Arg('last', () => Number, { nullable: true })(target, functionName, 3)
    Field(() => Connection, { name: `${String(sdlName)}`, ...fieldOptions })(target, functionName, { value: true })
  }

  /**
   * Create the Edge for the given node type & augment
   * @param connectionName name of the connection to prefix the edge
   * @param nodeType type of the node for this edge
   * @param edgeAugment optional type to augment the edge with
   */
  protected makeEdge<T extends TypeValue>(connectionName: string, nodeType: () => T, edgeAugment: () => new () => any): new () => Relay.Edge<T> {
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
  protected makeConnection<T extends TypeValue>(
    connectionName: string,
    Edge: new () => Relay.Edge<T>,
    PageInfo: new () => Relay.PageInfo,
    options?: RelayedConnectionOptions,
  ): new () => Relay.Connection<T> {
    const nullable = options && options.field && options.field.nullable

    @ObjectType(`${connectionName}Connection`)
    class Connection implements Relay.Connection<T> {
      @Field(() => PageInfo)
      public pageInfo!: Relay.PageInfo;

      @Field(() => [Edge], { nullable })
      public edges!: Relay.Edge<T>[];
    }

    return Connection
  }

  /**
   * Get the local PageInfo model
   * @throws if PageInfo cannot be accessed.
   */
  protected getPageInfo(): new () => Relay.PageInfo {
    try {
      let PageInfoFn: () => new () => Relay.PageInfo;
      try {
        PageInfoFn = Container.get<() => (new () => Relay.PageInfo)>('PAGINATION_OBJECT')
      } catch (e) {
        // If we couldn't find a PageInfoFn, let's generate anew and retry
        AutoRelayConfig.generateObjects()
        PageInfoFn = Container.get<() => (new () => Relay.PageInfo)>('PAGINATION_OBJECT')
      }
      const PageInfo = PageInfoFn()

      if (!PageInfo) throw new Error(`Couldn't find or generate PageInfo Object`)
      return PageInfo
    } catch (e) {
      throw new Error(`Couldn't find or generate PageInfo Object`)
    }
  }
}
