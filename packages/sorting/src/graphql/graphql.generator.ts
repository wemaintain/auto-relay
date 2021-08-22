import { registerEnumType } from 'type-graphql';
import { ClassType, Arg } from 'type-graphql'
import { Container, Service } from "typedi"
import { ORMConnection, ORM_CONNECTION } from 'auto-relay'
import { getMetadataStorage } from 'type-graphql/dist/metadata/getMetadataStorage'
import { FieldMetadata, ResolverClassMetadata, FieldResolverMetadata } from 'type-graphql/dist/metadata/definitions'
import { OrderingValue, orderingValueGQLFactory, StandardEnum } from './ordering.input'

/**
 * Helper service to generate all the objects / enum we might need in the SDL
 * Such as column enum for sorting and the actual input type
 */
@Service()
export class GQLSortingGenerator {

  protected get orm(): ORMConnection {
    return Container.get(ORM_CONNECTION)
  }

  /**
   * Generate all the necesserary types to make a given query (fieldresolver) sortable
   *
   * @param type the type we'll allow sorting for
   * @param target objectType or resolver on which our fieldresolver is
   * @param propertyKey key containing our resolver
   */
  public generateForType<T = unknown>(
    type: ClassType<T>,
    target: ClassType,
    propertyKey: string,
  ): ClassType<OrderingValue<any, any>> | undefined {
    const Enum = this.createEnum(type, target, propertyKey)

    if (Enum) {
      const OrderingValue = orderingValueGQLFactory(type.name, Enum)
      Arg("order", () => [OrderingValue], { nullable: true })(target, propertyKey, 999999998)
      return OrderingValue
    }

  }


  /**
   * Create an Enum of sortableFields for a given type
   */
  protected createEnum(type: ClassType, target: ClassType, propertyKey: string): StandardEnum<any> | undefined {
    const sortables = this.findSortableFields(type)

    if (!sortables || !sortables.length) {
      Reflect.defineMetadata(AUTORELAY_ENUM_REVERSE_MAP, "false", target, propertyKey)
      return
    }

    const Enum = sortables.reduce((acc, sort) => { acc[sort.schemaName] = sort.schemaName; return acc }, {} as Record<string, string>)

    Reflect.defineMetadata(AUTORELAY_ENUM_REVERSE_MAP, sortables, target, propertyKey)
    registerEnumType(Enum, { name: `${type.name}SortableFields` })
    return Enum
  }

  /**
   * Find all the fields that are sortable for a given type
   * Currently, sortable fields are:
   * 
   * - @Fields that are columns aswell in the orm
   *
   * @param type type to find sortable fields for
   */
  protected findSortableFields<T = unknown>(type: ClassType<T>): SortableField[] {
    const gqlFields = this.findGqlfieldsOfType(type)
    const columns = this.orm.getColumnsOfFields(() => type, gqlFields.map(f => f.name))

    return (
      Object.keys(columns).map(column => gqlFields.find(field => field.name === column))
    ) as SortableField[]
  }

  /**
   * Find all the fields (fields + fieldResolvers) declared in a given class
   * @param type the @ObjectType or @InputType decorated class to search for
   */
  protected findGqlfieldsOfType<T = unknown>(type: ClassType<T>): SortableField[] {
    const gqlFields: SortableField[] = []
    const resolversForThisType: Function[] = []

    const { fields, resolverClasses, fieldResolvers }: { fields: FieldMetadata[], resolverClasses: ResolverClassMetadata[], fieldResolvers: FieldResolverMetadata[] }
      = getMetadataStorage() as any

    resolversForThisType.push(
      ...resolverClasses.filter(resolver => {
        let resolverObjectType: Function;
        try {
          resolverObjectType = resolver.getObjectType()
        } catch(e) {
          // resolver is abstract, skip.
          return false
        }
        return  resolverObjectType === type
      })
        .map(resolver => resolver.target)
    )

    const basicFields = fields.filter(field => field.target === type)
      .map(field => ({
        name: field.name,
        schemaName: field.schemaName,
        type: field.target as any
      }))

    const fieldInResolvers = fieldResolvers.filter(fieldResolver => resolversForThisType.includes(fieldResolver.target))
      .map(fieldResolver => ({
        name: fieldResolver.methodName,
        schemaName: fieldResolver.schemaName,
        type: fieldResolver.target as any
      }))

    gqlFields.push(...basicFields,...fieldInResolvers)

    return gqlFields
  }

}


export interface SortableField {
  /** name of the property in the class */
  name: string,
  /** public name exposed in the schema */
  schemaName: string
  /** class to which we're linked */
  type: ClassType
}

export const AUTORELAY_ENUM_REVERSE_MAP = Symbol(`Reverse map to find fields that are being used as enum values for sorting`)