import { LimitOffsetPagingService } from './../services/limit-offset-paging.service';
import { Container } from 'typedi';
import { RelayLimitOffsetArgs } from './../interfaces/relay-limit-offset-arg.interface';
import { createParamDecorator } from "type-graphql";
import { connectionArgsFromResolverData } from '../helpers/pagination-args-from-data.function';

export function RelayLimitOffset(): ParameterDecorator {
  return (prototype, propertyKey, parameterIndex) => {
    return createParamDecorator(
      RelayLimitOffsetResolverFactory(prototype, String(propertyKey))
    )(prototype, propertyKey, parameterIndex);
  }
}

export const RelayLimitOffsetResolverFactory = (prototype: any, propertyKey: string) => {
  return (resolverData: any): RelayLimitOffsetArgs => {
    const args = connectionArgsFromResolverData(prototype, propertyKey, resolverData)
    return { ...Container.get(LimitOffsetPagingService).getLimitOffset(args), _originalArgs: args }
  }
}
