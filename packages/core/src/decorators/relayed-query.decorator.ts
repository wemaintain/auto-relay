import { Container } from 'typedi'
import { ClassValueThunk } from '../'
import { AdvancedOptions } from 'type-graphql/dist/decorators/types'
import { DynamicObjectFactory } from '../graphql/dynamic-object.factory'
import { Query, UseMiddleware, Args, Arg } from 'type-graphql'
import { RelayFromArrayCountFactory } from '../middlewares/relay-from-array-count.middleware'

export function RelayedQuery<Model = any>(to: ClassValueThunk<Model>): RelayedQueryFactory<Model, false>
export function RelayedQuery<Model = any>(to: ClassValueThunk<Model>, options: RelayedQueryOptions): RelayedQueryFactory<Model, false>
export function RelayedQuery<Model = any, Through = any>(to: ClassValueThunk<Model>, through: ClassValueThunk<Through>): RelayedQueryFactory<Through, true>
export function RelayedQuery<Model = any, Through = any>(to: ClassValueThunk<Model>, through: ClassValueThunk<Through>, options: RelayedQueryOptions): RelayedQueryFactory<Through, true>
export function RelayedQuery<Model = any, Through = any>(to: ClassValueThunk<Model>, through?: ClassValueThunk<Through> | RelayedQueryOptions, options?: RelayedQueryOptions): RelayedQueryFactory<Through extends (undefined | null) ? Model : Through, Through extends (undefined | null) ? false : true> {

  if (typeof through !== "function") {
    options = through
    through = undefined;
  }

  return (
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<
      RelayedQueryGetterFunction<
        Through extends (undefined | null) ? Model : Through,
        Through extends (undefined | null) ? never : true
      >
    >
  ) => {

    process.nextTick(() => {
      const queryName = options && options.name ? options.name : propertyKey;
      const dynamicObjectFactory = Container.get(DynamicObjectFactory);
      const { Connection } = dynamicObjectFactory.makeEdgeConnection(queryName, to, through as ClassValueThunk<Through> | undefined);
      const ConnectionArgsThunk: () => Function = Container.get('CONNECTIONARGS_OBJECT');
      const ConnectionArgs = ConnectionArgsThunk();

      if (options && options.paginationInputType) {
        const name = typeof options.paginationInputType === 'string' ? options.paginationInputType : 'pagination';
        Reflect.defineMetadata('autorelay:connectionArgs:key', name, target, propertyKey)
        Arg(name, () => ConnectionArgs, { nullable: true })(target, propertyKey, 99999999);
      } else {
        Args(() => ConnectionArgs)(target, propertyKey, 99999999);
      }

      const middleware = RelayFromArrayCountFactory(target, propertyKey);
      UseMiddleware(middleware)(target, propertyKey, descriptor)
      Query(() => Connection, { ...options, name: queryName })(target, propertyKey, descriptor)
    })

  }
}

export type RelayedQueryGetterFunction<Model = any, U = false> = (...arg: any[]) => U extends true ? Promise<[number, Model[], keyof Model]> : Promise<[number, Model[]]>;
export type RelayedQueryFactory<T = unknown, U = false> = (target: Object, propertKey: string, descriptor: TypedPropertyDescriptor<RelayedQueryGetterFunction<T, U>>) => void


export type RelayedQueryOptions = RelayLimitOffsetOptions & AdvancedOptions;

export interface RelayLimitOffsetOptions {
  /** 
   * set to true if you don't want to use an input type instead of inlining pagination args
   * You can optionally supply the key you want them to be in
   */
  paginationInputType?: boolean | string
}