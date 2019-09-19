import { Container } from 'typedi'
import { ClassValueThunk } from '../'
import { AdvancedOptions } from 'type-graphql/dist/decorators/types'
import { RelayedQueryService } from '../services/relay-query.service';

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
      Container.get(RelayedQueryService).makeMethodRelayedQuery(target, propertyKey, descriptor, to, through as  ClassValueThunk<Through> | undefined, options)
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