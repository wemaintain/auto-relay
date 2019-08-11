import { ResolverData } from "type-graphql";
import { ConnectionArguments } from "graphql-relay";

/**
 * Extract Connection arguments for a given query that has previously been decorated and
 * is currently being executed
 * 
 * @param prototype prototype of our resolver
 * @param propertyKey name of the getter method on the resolver
 * @param resolverData data we got from the resolver instance
 */
export function connectionArgsFromResolverData(prototype: any, propertyKey: string, resolverData: ResolverData): ConnectionArguments {
  let args = resolverData.args;
  const paginationKey = Reflect.getMetadata('autorelay:connectionArgs:key', prototype, propertyKey)

  if (paginationKey) { args = args[paginationKey] }

  return args;
}