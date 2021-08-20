import { SortingService } from './../services/sorting.service';
import { Container } from 'typedi';
import { createParamDecorator } from "type-graphql";

/**
 * Get order options supplied by 
 * @param prefix 
 */
export function OrderOptions<T = any>(prefix?: string) {
  return (target: any, propertyKey: string, parameterIndex: number) =>{ 
    return createParamDecorator(
      resolverData => Container.get(SortingService).buildOrderObject(resolverData, target, propertyKey, prefix)
    )(target, propertyKey, parameterIndex)}
}

export type TypeORMOrdering<Entity = any> = {
  [P in keyof Entity]?: {
    order: "ASC"|"DESC";
    nulls?: "NULLS FIRST"|"NULLS LAST";
  }
}