import { AutoRelayConfig, PAGINATION_OBJECT, PREFIX, CONNECTION_BASE_OBJECT } from './../services/auto-relay-config.service';
import { RelayedConnectionOptions } from './../decorators/relayed-connection.decorator';
import { Service, Container } from 'typedi'
import { TypeValue, ClassValueThunk } from '../types/types'
import { Field, ObjectType, Arg, ClassType, Int } from 'type-graphql'
import * as Relay from 'graphql-relay'

/**
 * Factory service for generating Objects that are dynamic and might be appened multiple times
 * to the SDL. Such as Edges and Connections
 */
@Service()
export class DynamicObjectFactory {

  /** Map of Edge & Connections object as a cache for already created ones */
  protected edgeConnectionCache = new Map<string, ConnectionEdgeType>()

  /**
   * Returns the Edge and Connection Object class decorated and injected in the SDL
   * Will return a relay Edge and Connection Object to be used when fetching this specific Entity
   *
   * @param To type of the Entity we're linking to
   * @param Through if the relation is N:M, "augment" the edge with the join table
   * @param options user defined options for this edge/connection
   */
  public getEdgeConnection<T = any>(
    to: ClassValueThunk<T>,
    through: ClassValueThunk<any> = () => Object,
    options?: RelayedConnectionOptions,
  ): ConnectionEdgeType<T> {
    const connectionName = this.getConnectionName(to, through)

    if (!this.edgeConnectionCache.has(connectionName)) {
      const PageInfo = this.getPageInfo()
      const Edge = this.makeEdge(connectionName, to, through)
      const Connection = this.makeConnection(connectionName, Edge, PageInfo, options)

      this.edgeConnectionCache.set(connectionName, { Edge, Connection })
    }

    return this.edgeConnectionCache.get(connectionName) as ConnectionEdgeType<T>
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
    Arg('first', () => Int, { nullable: true })(target, functionName, 1)
    Arg('before', () => String, { nullable: true })(target, functionName, 2)
    Arg('last', () => Int, { nullable: true })(target, functionName, 3)
    Field(() => Connection, { name: `${String(sdlName)}`, ...fieldOptions })(target, functionName, { value: true })
  }

  /**
   * Create the Edge for the given node type & augment
   * @param connectionName name of the connection to prefix the edge
   * @param to type of the node for this edge
   * @param through optional type to augment the edge with
   */
  protected makeEdge<T extends TypeValue>(
    connectionName: string,
    to: () => T,
    through: () => new () => any
  ): ClassType<Relay.Edge<T>> {
    const Edge = class extends through().prototype.constructor implements Relay.Edge<T> {
      public node!: T;

      public cursor!: Relay.ConnectionCursor;
    }

    Object.assign(Edge, through())

    Field(to)(Edge.prototype, 'node')
    Field(() => String, { description: 'Used in `before` and `after` args' })(Edge.prototype, 'cursor')
    ObjectType(`${this.getPrefix()}${connectionName}Edge`)(Edge)

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
    Edge: ClassType<Relay.Edge<T>>,
    PageInfo: ClassType<Relay.PageInfo>,
    options?: RelayedConnectionOptions,
  ): ClassType<Relay.Connection<T>> {
    const nullable = options && options.field && options.field.nullable

    const baseClass = this.getBaseConnection()

    @ObjectType(`${this.getPrefix()}${connectionName}Connection`)
    class Connection extends baseClass() implements Relay.Connection<T> {
      @Field(() => PageInfo)
      public pageInfo!: Relay.PageInfo;

      @Field(() => [Edge], { nullable })
      public edges!: Relay.Edge<T>[];
    }

    return Connection
  }

  /**
   * Get the base Connection model if any
   */
  protected getBaseConnection(): ClassValueThunk<any>  {
    try {
      return Container.get(CONNECTION_BASE_OBJECT)
    } catch(e) { }

    return () => Object
  }

  /**
   * Get the local PageInfo model
   * @throws if PageInfo cannot be accessed.
   */
  protected getPageInfo(): ClassType<Relay.PageInfo> {
    try {
      let PageInfoFn: ClassValueThunk<Relay.PageInfo>;
      try {
        PageInfoFn = Container.get(PAGINATION_OBJECT)
      } catch (e) {
        // If we couldn't find a PageInfoFn, let's generate anew and retry
        AutoRelayConfig.generateObjects()
        PageInfoFn = Container.get(PAGINATION_OBJECT)
      }
      const PageInfo = PageInfoFn()

      if (!PageInfo) throw new Error(`Couldn't find or generate PageInfo Object`)
      return PageInfo
    } catch (e) {
      throw new Error(`Couldn't find or generate PageInfo Object`)
    }
  }

  /**
   * Computes the name of the Connection in the SDL
   *
   * @param to the Object we're linking to
   * @param through optional Through object to get the To object
   */
  protected getConnectionName(to: ClassValueThunk<any>, through?: ClassValueThunk<any>): string {
    return `${through && through().name !== "Object" ? through().name : ''}${to().name}`
  }

  /**
   * Returns currently defined prefix
   */
  protected getPrefix(): string {
    try {
      return Container.get(PREFIX)
    } catch(e) {
      return ""
    }
  } 

}

export type ConnectionEdgeType<T = any> = { Connection: ClassType<Relay.Connection<ClassType<T>>>; Edge: ClassType<Relay.Edge<ClassType<T>>> }