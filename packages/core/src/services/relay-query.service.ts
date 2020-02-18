import { RelayedQueryOptions, RelayedQueryTypedDescriptor, LimitOffsetOptions } from './../decorators/relayed-query.decorator'
import { Container, Service } from "typedi"
import { DynamicObjectFactory } from "../graphql/dynamic-object.factory"
import { ClassValueThunk } from "../types"
import { RelayFromArrayCountFactory } from "../middlewares/relay-from-array-count.middleware"
import { UseMiddleware, Query, Args, Arg, FieldResolver } from "type-graphql"
import { CONNECTIONARGS_OBJECT, CONFIG } from './auto-relay-config.service'

/**
 * Abstracts the logic for registering paginated queries / field resolvers
 * automatically
 */
@Service()
export class RelayedQueryService {

  /**
   * Mark a given method on a class as being a `@Query()` but following the Relay specs
   * for args and return type (ie: returns a Collection not an array) 
   */
  public makeMethodRelayedQuery<Model = any, Through = any>(
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<
      RelayedQueryTypedDescriptor<
        Through extends (undefined | null) ? Model : Through,
        Through extends (undefined | null) ? never : true
      >
    >,
    to: ClassValueThunk<Model>, 
    through?: ClassValueThunk<Through>, 
    options?: RelayedQueryOptions,
  ):void {
    this.relayQueryOrFieldResolver(target, propertyKey, descriptor, to, through, options)
  }

  /**
   * Mark a given method on a class as being a `@FieldResolver()` but following the Relay specs
   * for args and return type (ie: returns a Collection not an array) 
   */
  public makeMethodRelayedFieldResolver<Model = any, Through = any>(
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<
      RelayedQueryTypedDescriptor<
        Through extends (undefined | null) ? Model : Through,
        Through extends (undefined | null) ? never : true
      >
    >,
    to: ClassValueThunk<Model>, 
    through?: ClassValueThunk<Through>,
    options?: RelayedQueryOptions,
  ) {
    this.relayQueryOrFieldResolver(target, propertyKey, descriptor, to, through, options, true)
  }

  protected relayQueryOrFieldResolver<Model = any, Through = any>(
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<
      RelayedQueryTypedDescriptor<
        Through extends (undefined | null) ? Model : Through,
        Through extends (undefined | null) ? never : true
      >
    >,
    to: ClassValueThunk<Model>, 
    through?: ClassValueThunk<Through>,
    options?: RelayedQueryOptions,
    isFieldResolver: boolean = false
  ): void {
    Reflect.defineMetadata('autorelay:query:options', JSON.stringify({ ...this.getGlobalOptions(), ...options }), target, propertyKey)
    const queryName = this.getQueryName(propertyKey, options)
    const { Connection } = this.makeEdgeConnection(to, through)
    this.registerArgs(target, propertyKey, options)

    const middleware = RelayFromArrayCountFactory(target, propertyKey);
    UseMiddleware(middleware)(target, propertyKey, descriptor)
    if(isFieldResolver) {
      FieldResolver(() => Connection, { ...options, name: queryName })(target, propertyKey, descriptor)
    } else {
      Query(() => Connection, { ...options, name: queryName })(target, propertyKey, descriptor)
    }
  }

  protected makeEdgeConnection<Model = any, Through = any>(
    to: ClassValueThunk<Model>, 
    through?: ClassValueThunk<Through>
  ) {
    const dynamicObjectFactory = Container.get(DynamicObjectFactory);
    return dynamicObjectFactory.getEdgeConnection(to, through);
  }

  /**
   * Computes name of the query/field for SDL. Could be either the name of the property
   * or an user defined name
   *
   * @param propertyKey name of the property we were defined on
   * @param options user defined options to overide with
   */
  protected getQueryName(propertyKey: string, options?: RelayedQueryOptions ): string {
    return options && options.name ? options.name : propertyKey;
  }

  /**
   * Register either Arg or Args on a given target based on supplied options
   * @param options 
   * @param target 
   * @param propertyKey 
   */
  protected registerArgs(target: Object, propertyKey: string, options?: RelayedQueryOptions,) {
    const ConnectionArgsThunk = Container.get(CONNECTIONARGS_OBJECT);
    const ConnectionArgs = ConnectionArgsThunk();

    if (options && options.paginationInputType) {
      // We want our pagination to be a named input rather than args
      const name = typeof options.paginationInputType === 'string' ? options.paginationInputType : 'pagination';
      Reflect.defineMetadata('autorelay:connectionArgs:key', name, target, propertyKey)
      Arg(name, () => ConnectionArgs, { nullable: true })(target, propertyKey, 99999999);
    } else {
      Args(() => ConnectionArgs)(target, propertyKey, 99999999);
    }
  }

  /**
   * Get global options to use for a Query/fieldResolver
   */
  protected getGlobalOptions(): LimitOffsetOptions {
    try {
      return { ...Container.get(CONFIG).pagination }
    } catch(e) {
      // Couldn't load global config, ignore it.
    }
    return { }
  }
}