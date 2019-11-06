import { AutoRelayRoot } from './../interfaces/auto-relay-root-metadata.interface';
import { RelayLimitOffsetResolverFactory } from './../decorators/limit-offset.decorator';
import { ResolverData, NextFn } from "type-graphql";
import { connectionArgsFromResolverData } from '../helpers/pagination-args-from-data.function';
import { augmentedConnection } from '../helpers/augment-connection.function';
import * as Relay from 'graphql-relay'

/**
 * Middleware function factory to be used on any RelayField/RelayQuery whose methods
 * return a [number, Array<Object>] tuple.
 *
 * Will transform that tuple into a Relay Connection as expected by the SDL
 *
 * @param prototype the prototype of our resolver
 * @param propertyKey key on the resolver we're accessing
 */
export function RelayFromArrayCountFactory<TContext = {}>(prototype: any, propertyKey: string) {
  return async <Model = any, Through = any>(resolverData: ResolverData<TContext>, next: NextFn) => {
    const [entityCount, entities, throughKey] = (await next() as [number, Array<Model | Through>, keyof Through | undefined]);

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
