import { ResolverData } from 'type-graphql'
import { Container, Service } from "typedi"
import { TypeORMOrdering, TypeORMOrderByConditionValue } from '../decorators/order-options.decorator'
import { TypeOrmConnection } from '../type-orm-connection'
import { ClassType } from "auto-relay";

@Service()
export class SortingService {

  protected typeOrmConnection: TypeOrmConnection = Container.get(TypeOrmConnection)

  public buildOrderObject(
    resolverData: ResolverData,
    target: ClassType,
    propertyKey: string,
    prefix: string = ""
  ): TypeORMOrdering {
    let getSortablesFromResolverData!: Function 
    try {
      getSortablesFromResolverData = require("@auto-relay/sorting").getSortablesFromResolverData
    } catch(e) {
      throw new Error(`Couldn't loading sorting module. Did you forgot to install @auto-relay/sorting ?`)
    }

    const sortingFields: { 
      name: string, 
      type: ClassType, 
      direction: "ASC" | "DESC", 
      nulls?: "FIRST" | "LAST",
    }[] = getSortablesFromResolverData(resolverData, target, propertyKey)

    if (!sortingFields.length) return {}

    const dbColumns = this.typeOrmConnection.getColumnsOfFields(
      () => sortingFields[0].type,
      sortingFields.map((sf) => sf.name)
    )

    return sortingFields.reduce((acc: TypeORMOrdering, sortingField) => {
      const dbName = dbColumns[sortingField.name]
      acc[`${prefix}${dbName}`] = this.buildOrderByConditionValue(sortingField)
      return acc
    }, {} as TypeORMOrdering)

  }

  /**
   * Build the correct TypeORMOrderByConditionValue matching the internal TypeORM OrderByCondition type
   * When nulls is not provided, it uses the short form: `("ASC"|"DESC")`
   * When nulls is provided, it uses the long form: `{order, nulls}`
   * 
   * @param sortingField The SortingField to build
   * @returns TypeORMOrderByConditionValue
   */
  protected buildOrderByConditionValue(sortingField: {
    direction: "ASC" | "DESC", 
    nulls?: "FIRST" | "LAST",
  }): TypeORMOrderByConditionValue {
    if(!sortingField.nulls){
      return sortingField.direction
    }

    return {
      order: sortingField.direction,
      nulls: (sortingField.nulls === "FIRST") ? "NULLS FIRST" : "NULLS LAST"
    }
  }

}