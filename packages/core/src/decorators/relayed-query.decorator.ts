import { Container } from 'typedi'
import { ClassValueThunk } from '../'
import { AdvancedOptions } from 'type-graphql/dist/decorators/types'
import { RelayedQueryService } from '../services/relay-query.service';

export function RelayedQuery<Model = any, Through = undefined>(to: ClassValueThunk<Model>): RelayedQueryFactory<Model, false>
export function RelayedQuery<Model = any, Through = undefined>(to: ClassValueThunk<Model>, options: RelayedQueryOptions): RelayedQueryFactory<Model, false>
export function RelayedQuery<Model = any, Through = any>(to: ClassValueThunk<Model>, through: ClassValueThunk<Through>): RelayedQueryFactory<Through, true>
export function RelayedQuery<Model = any, Through = any>(to: ClassValueThunk<Model>, through: ClassValueThunk<Through>, options: RelayedQueryOptions): RelayedQueryFactory<Through, true>
export function RelayedQuery<Model = any, Through = any>(to: ClassValueThunk<Model>, through?: ClassValueThunk<Through> | RelayedQueryOptions, options?: RelayedQueryOptions): RelayedQueryFactory<Through extends (undefined | null) ? Model : Through, Through extends (undefined | null) ? false : true> {

  if (typeof through !== "function") {
    options = through
    through = undefined;
  }

  return <ActualModel = Through extends (undefined | null) ? Model : Through, HasThrough extends boolean =Through extends (undefined | null) ? never : true>(
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    process.nextTick(() => {
      Container.get(RelayedQueryService).makeMethodRelayedQuery(target, propertyKey, descriptor, to, through as  ClassValueThunk<Through> | undefined, options)
    })
  }
}

export type RelayedQueryTypedDescriptor<ActualModel=any, HasThrough extends boolean = false> = 
| RelayedQueryGetterFunction<[number, ActualModel[], HasThrough extends true ? keyof ActualModel : void]>
| RelayedQueryGetterFunction<[ActualModel[], number, HasThrough extends true ? keyof ActualModel : void]>
| RelayedQueryGetterFunction<EntityWithCounts<ActualModel, HasThrough>>

export type RelayedQueryGetterFunction<Y> = (...arg: any[]) => Promise<Y>

export type RelayedQueryFactory<ActualModel = unknown, HasThrough extends boolean = false> =
(
   target: Object,
   propertKey: string,
   descriptor: 
    | (HasThrough extends true ? TypedPropertyDescriptor<RelayedQueryGetterFunction<[ActualModel[], number, keyof ActualModel]>> : TypedPropertyDescriptor<RelayedQueryGetterFunction<[ActualModel[], number]>>)
    | (HasThrough extends true ? TypedPropertyDescriptor<RelayedQueryGetterFunction<[number, ActualModel[], keyof ActualModel]>> : TypedPropertyDescriptor<RelayedQueryGetterFunction<[number, ActualModel[]]>>)
    | (TypedPropertyDescriptor<RelayedQueryGetterFunction<EntityWithCounts<ActualModel, HasThrough>>>)
    ) => void

export type RelayedQueryOptions = LimitOffsetOptions & AdvancedOptions;

/**
 * Object to return to build a relay'd query
 */
export interface EntityWithCounts<Model = any, HasThrough extends boolean = false> {
  /** total amount of matching results */
  count: number
  /** actual rows to be returned for pagination */
  rows: Model[]
  /** key when using a through */
  key?: HasThrough extends true ? keyof Model : undefined
}

export interface LimitOffsetOptions {
  /** 
   * set to true if you don't want to use an input type instead of inlining pagination args
   * You can optionally supply the key you want them to be in
   */
  paginationInputType?: boolean | string
}
