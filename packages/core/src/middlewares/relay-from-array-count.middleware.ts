import { RelayLimitOffsetResolverFactory } from './../decorators/limit-offset.decorator';
import { ResolverData, NextFn } from "type-graphql";
import { connectionArgsFromResolverData } from '../helpers/pagination-args-from-data.function';
import { augmentedConnection } from '../helpers/augment-connection.function';
import * as Relay from 'graphql-relay'

export function RelayFromArrayCountFactory<TContext = {}>(prototype: any, propertyKey: string) {
  return async <Model = any, Through = any>(resolverData: ResolverData<TContext>, next: NextFn) => {
    const [entityCount, entities, throughKey] = (await next() as [number, Array<Model | Through>, keyof Through | undefined]);

    const args = connectionArgsFromResolverData(prototype, propertyKey, resolverData);
    const pagination = RelayLimitOffsetResolverFactory(prototype, propertyKey)(resolverData);

    const connection = Relay.connectionFromArraySlice(entities, args, { sliceStart: pagination.offset || 0, arrayLength: entityCount })

    if (throughKey) {
      return augmentedConnection(connection, String(throughKey));
    } else {
      return connection;
    }
  }
}
