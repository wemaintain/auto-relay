import { ClassType, ResolverData } from 'type-graphql'
import { Container, Service } from "typedi"
import { TypeORMOrdering } from '../decorators/order-options.decorator'
import { TypeOrmConnection } from '../type-orm-connection'

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

    const sortingFields: { name: string, type: ClassType, direction: "ASC" | "DESC" }[] = getSortablesFromResolverData(resolverData, target, propertyKey)
    if (!sortingFields.length) return {}

    const dbColumns = this.typeOrmConnection.getColumnsOfFields(
      () => sortingFields[0].type,
      sortingFields.map((sf) => sf.name)
    )

    return sortingFields.reduce((acc: TypeORMOrdering, sortingField) => {
      const dbName = dbColumns[sortingField.name]
      acc[`${prefix}${dbName}`] = sortingField.direction
      return acc
    }, {} as TypeORMOrdering)

  }

}