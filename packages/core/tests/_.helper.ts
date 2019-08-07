import { GraphQLSchema, GraphQLObjectType, GraphQLFieldConfig } from 'graphql'

export type GraphQLObjectTypeConfig = ReturnType<GraphQLObjectType['toConfig']>;


export function getConfigOfObjectType(schema: GraphQLSchema, typeName: string): GraphQLObjectTypeConfig {
  const pageInfoType: GraphQLObjectType = schema.getType(typeName) as GraphQLObjectType
  if (!pageInfoType) throw new Error(`Couldn't find Object ${typeName} in SDL`)
  const node = pageInfoType.toConfig()

  return node
}

export function getFieldOfObjectType(schema: GraphQLSchema, objectType: GraphQLObjectType, fieldName: string): GraphQLFieldConfig<any, any, any>;
export function getFieldOfObjectType(schema: GraphQLSchema, typeConfig: GraphQLObjectTypeConfig, fieldName: string): GraphQLFieldConfig<any, any, any>;
export function getFieldOfObjectType(schema: GraphQLSchema, typeName: string, fieldName: string): GraphQLFieldConfig<any, any, any>;
export function getFieldOfObjectType(schema: GraphQLSchema, t: string | GraphQLObjectType | GraphQLObjectTypeConfig, fieldName: string): GraphQLFieldConfig<any, any, any> {
  let node: GraphQLObjectTypeConfig = t as GraphQLObjectTypeConfig
  if (typeof t === 'string') {
    node = getConfigOfObjectType(schema, t);
  } else if (!(t as GraphQLObjectTypeConfig).fields) {
    node = (t as GraphQLObjectType).toConfig();
  }

  if (!node) {
    throw new Error(`Couldn't find config for ${t}`);
  }

  if (!node.fields) {
    throw new Error(`${t} has no fields`);
  }

  if (!node.fields[fieldName]) {
    throw new Error(`${fieldName} doesn't exist on ${t}`)
  }

  return node.fields[fieldName];
}
