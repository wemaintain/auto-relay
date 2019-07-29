import { AugmentedConnection } from 'auto-relay/interfaces/augmented-connection.interface'
import { ORMConnection, ClassValueThunk } from 'auto-relay'

export class TypeOrmConnection extends ORMConnection {
  public async findRelayedEntityFunctionFactory<T = any, Y = any> (field: string, self: ClassValueThunk, type: ClassValueThunk<T>, through?: ClassValueThunk<Y>): Promise<AugmentedConnection<T, Y>> {
    const { limit, offset } = getPagingParametersOfRelayArgs({ after, first, before, last })
    const Entity = type() as typeof BaseEntity
    const ThroughEntity = through ? through() as typeof BaseEntity : undefined
    const throughKey = findPropertyNameBetweenEntityAndThrough(Entity, ThroughEntity)
    // Find the relation we're fetching for as decorated by typeORM
    const { metadatas, relation } = getMedataAndRelationForEntity(propertyKey, Entity, ThroughEntity, Self)

    // Construct the object of properties we need in our where. (ie: join column names)
    const neededProps = relation.joinColumns.reduce((needed, column) => {
      needed[column.referencedColumn.propertyName] = this[column.referencedColumn.propertyName]
      return { ...needed }
    }, {} as { [key: string]: any })

    const findOptions: FindManyOptions<BaseEntity> = {
      where: {
        [relation.propertyPath]: neededProps,
      },
      skip: offset,
      take: limit,
    }

    if (ThroughEntity) {
      findOptions.relations = [throughKey]
    }

    return (ThroughEntity || Entity).findAndCount(findOptions).then(([entities, count]) => {
      const c = Relay.connectionFromArraySlice(
        entities,
        { after, first, before, last },
        { arrayLength: count, sliceStart: offset || 0 },
      )

      if (ThroughEntity) {
        return augmentedConnection(c, throughKey)
      } else {
        return c
      }
    })
  }
}
