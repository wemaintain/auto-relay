import { ClassType, ResolverData } from 'type-graphql'
import Container, { Service } from "typedi"
import { getSortablesFromResolverData } from '@auto-relay/sorting'
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
    const sortingFields = getSortablesFromResolverData(resolverData, target, propertyKey)
    if (!sortingFields.length) return {}

    const dbColumns = this.typeOrmConnection.getColumnsOfFields(
      () => sortingFields[0].type,
      sortingFields.map((sf) => sf.name)
    )

    return sortingFields.reduce((acc, sortingField) => {
      const dbName = dbColumns[sortingField.name]
      acc[`${prefix}${dbName}`] = sortingField.direction
      return acc
    }, {} as TypeORMOrdering)

  }

}