import { ClassValueThunk } from "../types";
import { RelayedQueryFactory, RelayedQueryOptions } from "./relayed-query.decorator";
import { Container } from "typedi";
import { RelayedQueryService } from "../services/relay-query.service";

export function RelayedFieldResolver<Model = any>(to: ClassValueThunk<Model>): RelayedQueryFactory<Model, false>
export function RelayedFieldResolver<Model = any>(to: ClassValueThunk<Model>, options: RelayedQueryOptions): RelayedQueryFactory<Model, false>
export function RelayedFieldResolver<Model = any, Through = any>(to: ClassValueThunk<Model>, through: ClassValueThunk<Through>): RelayedQueryFactory<Through, true>
export function RelayedFieldResolver<Model = any, Through = any>(to: ClassValueThunk<Model>, through: ClassValueThunk<Through>, options: RelayedQueryOptions): RelayedQueryFactory<Through, true>
export function RelayedFieldResolver<Model = any, Through = any>(to: ClassValueThunk<Model>, through?: ClassValueThunk<Through> | RelayedQueryOptions, options?: RelayedQueryOptions): RelayedQueryFactory<Through extends (undefined | null) ? Model : Through, Through extends (undefined | null) ? false : true> {
  if (typeof through !== "function") {
    options = through
    through = undefined;
  }

  return (target, propertyKey, descriptor) => {
    process.nextTick(() => {
      Container.get(RelayedQueryService).makeMethodRelayedFieldResolver(target, propertyKey, descriptor, to, through as  ClassValueThunk<Through> | undefined, options)
    })
  }
}