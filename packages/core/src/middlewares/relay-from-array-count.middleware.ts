import { RelayedQueryGetterFunction, EntityWithCounts, RelayedQueryTypedDescriptor } from './../decorators/relayed-query.decorator'
import { AutoRelayRoot } from './../interfaces/auto-relay-root-metadata.interface'
import { RelayLimitOffsetResolverFactory } from './../decorators/limit-offset.decorator'
import { ResolverData, NextFn } from "type-graphql"
import { connectionArgsFromResolverData } from '../helpers/pagination-args-from-data.function'
import { augmentedConnection } from '../helpers/augment-connection.function'
import * as Relay from 'graphql-relay'

type UnPromisify<T> = T extends Promise<infer U> ? U : T;

/**
 * Middleware function factory to be used on any RelayField/RelayQuery whose methods
 * return a [number, Array<Object>] tuple.
 *
 * Will transform that tuple into a Relay Connection as expected by the SDL
 *
 * @param prototype the prototype of our resolver
 * @param propertyKey key on the resolver we're accessing
 */
export function RelayFromArrayCountFactory<
  TContext = {},
  Model=any,
  HasThrough extends boolean = false
> ( 
  prototype: any,
  propertyKey: string
) {
  return async (
    resolverData: ResolverData<TContext>,
    next: RelayedQueryTypedDescriptor<Model, HasThrough>
  ) => {
    const [entityCount, entities, throughKey] = extractGetterFunctionReturn(await next())

    const args = connectionArgsFromResolverData(prototype, propertyKey, resolverData);
    const pagination = RelayLimitOffsetResolverFactory(prototype, propertyKey)(resolverData);
    const connection = Relay.connectionFromArraySlice(entities, args, { sliceStart: pagination.offset || 0, arrayLength: entityCount })

    const metadatas = { _autoRelayMetadata: { totalItems: entityCount } } as AutoRelayRoot

    Object.assign(connection, metadatas)
    Object.assign(connection.pageInfo, metadatas)

    if (throughKey) {
      return augmentedConnection(connection, String(throughKey));
    } else {
      return connection;
    }
  }
}


export function extractGetterFunctionReturn<Model = any, U extends boolean = false>(
  payload: UnPromisify<ReturnType<RelayedQueryTypedDescriptor<Model, U>>>
): [number, Model[], (keyof Model)?] {

  if (Array.isArray(payload)) {
    if (typeof payload[0] === "number")  {
      return payload as [number, Model[], (keyof Model)?]
    } else if(typeof payload[1] === "number") {
      const [models, count, key] = payload as [Model[],number,(keyof Model)?]
      return [count, models, key]
    } else {
      throw new WrongReturnType(`got [${typeof payload[0]}, ${typeof payload[1]}, ${typeof payload[2]}] instead of expected [number, entity[]] or [entity[], number] }`)
    }
  } else {
    const { count, rows, key } = payload

    if (typeof count !== "number") throw new WrongReturnType(`count is supposed to be number, got ${count} instead`)
    if (!Array.isArray(rows)) throw new WrongReturnType(`rows is supposed to be array, got ${rows} instead`)

    return [count, rows, key]
  }

}


export class WrongReturnType extends Error {
  constructor(message: string) {
    super(`Wrong return type for Relayed method: ${message}`)
  }
}