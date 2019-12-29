import { registerEnumType } from 'type-graphql';
import { ClassType, Arg } from 'type-graphql'
import { Container, Service } from "typedi"
import { ORMConnection, ORM_CONNECTION } from 'auto-relay'
import { getMetadataStorage } from 'type-graphql/dist/metadata/getMetadataStorage'
import { FieldMetadata } from 'type-graphql/dist/metadata/definitions'
import { orderingValueGQLFactory, StandardEnum } from './ordering.input'

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
  ): void {
    const Enum =  this.createEnum(type)

    if (Enum) {
      const OrderingValue = orderingValueGQLFactory(type.name, Enum)
      Arg("order", () => [OrderingValue], { nullable: true })(target, propertyKey, 999999998)
    }
  }


  /**
   * Create an Enum of sortableFields for a given type
   */
  protected createEnum(type: ClassType): StandardEnum<any> | undefined {
    const sortables = this.findSortableFields(type)
    if (!sortables || !sortables.length) return
    const Enum = sortables.reduce((acc, sort) => {acc[sort.name] = sort.name; return acc}, {} as Record<string, string>)

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
    const sortables: SortableField[] = []
    const gqlFields = this.findGqlfieldsOfType(type)
    const columns = this.orm.getColumnsOfFields(() => type, gqlFields.map(f => f.name))

    for (let column of Object.keys(columns)) {
      sortables.push(gqlFields.find(field => field.name === column)!)
    }

    return sortables
  }

  /**
   * Find all the fields (fields + fieldResolvers) declared in a given class
   * @param type the @ObjectType or @InputType decorated class to search for
   */
  protected findGqlfieldsOfType<T=unknown>(type: ClassType<T>): SortableField[] {
    const gqlFields: SortableField[] = []
    const resolvers: any[] = []
    for (const field of (getMetadataStorage() as any).fields as FieldMetadata[]) {
      if (field.target === type) gqlFields.push({ 
        name: field.name,
        schemaName: field.schemaName,
        type: field.target as any
      })
    }

    for (const resolver of (getMetadataStorage() as any).resolverClasses) {
      if (resolver.getObjectType() === type) resolvers.push(resolver.target)
    }

    for (const fieldResolver of getMetadataStorage().fieldResolvers) {
      if (resolvers.includes(fieldResolver.target)) gqlFields.push({
        name: fieldResolver.methodName,
        schemaName: fieldResolver.schemaName,
        type: fieldResolver.target as any
      })
    }

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