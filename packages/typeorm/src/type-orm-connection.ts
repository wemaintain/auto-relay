/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-dupe-class-members */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { LimitOffsetPagingService, augmentedConnection } from 'auto-relay-common'
import { Container } from 'typedi'
import { getConnection, EntityMetadata, FindManyOptions, BaseEntity } from 'typeorm'
import { ORMConnection, ClassValueThunk, AutoRelayGetter, AugmentedConnection } from 'auto-relay'
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata'
import * as Relay from 'graphql-relay'

export class TypeOrmConnection extends ORMConnection {
  protected _pagingService = Container.get(LimitOffsetPagingService);

  public autoRelayFactory<T = unknown, Y = unknown> (
    field: string,
    self: ClassValueThunk,
    type: ClassValueThunk<T>,
    through?: ClassValueThunk<Y>,
  ): AutoRelayGetter {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const typeOrmConnection = this
    return async function (this: Record<string, unknown>, after?: string, first?: number, before?: string, last?: number): Promise<AugmentedConnection<T, Y>> {
      const pagination = typeOrmConnection._pagingService.getLimitOffset({ after, first, before, last })
      const Entity = type() as Function
      const ThroughEntity = through ? through() as Function : undefined
      const throughKey = typeOrmConnection._findPropertyNameBetweenEntityAndThrough(Entity, ThroughEntity)
      const findOptions = typeOrmConnection._findOptionsForEntity(field, Entity, self, this, pagination, throughKey, ThroughEntity as Function)

      const [entities, count] = await getConnection().manager.findAndCount<Y | T>(ThroughEntity || Entity, findOptions as FindManyOptions)

      const relayConnection = Relay.connectionFromArraySlice(
        entities,
        { after, first, before, last },
        { arrayLength: count, sliceStart: pagination.offset || 0 },
      )

      if (ThroughEntity) {
        return augmentedConnection(relayConnection as Relay.Connection<Y>, throughKey)
      } else {
        return relayConnection as AugmentedConnection<T, never>
      }
    }
  }

  /**
   * Create a TypeORM FindOptions for fetching paginated Entities linked to Self,
   * possibly through a joining ThroughEntity
   *
   * @param field name of the field linking Self & Entity
   * @param Entity type of Entity we're trying to fetch
   * @param self type of Self that is linked to Entity
   * @param record record of self as currently fetched
   * @param pagination pagination object as expected by typeorm
   * @param throughKey name of the property on ThroughEntity linking to Entity
   * @param ThroughEntity type of ThroughEntity linking Self to Entity
   */
  protected _findOptionsForEntity (field: string, Entity: Function, self: Function, record: Record<string, unknown>, pagination: { offset?: number; limit?: number }): FindManyOptions<BaseEntity>;

  protected _findOptionsForEntity (field: string, Entity: Function, self: Function, record: Record<string, unknown>, pagination: { offset?: number; limit?: number }, throughKey: string, ThroughEntity: Function): FindManyOptions<BaseEntity>;

  protected _findOptionsForEntity (field: string, Entity: Function, self: Function, record: Record<string, unknown>, pagination: { offset?: number; limit?: number }, throughKey?: string, ThroughEntity?: Function): FindManyOptions<BaseEntity> {
    const { relation } = this._getMedataAndRelationForEntity(field, Entity, self, ThroughEntity)
    const neededProps = this._neededPropsForJoin(record, relation)

    const findOptions: FindManyOptions<BaseEntity> = {
      where: {
        [relation.propertyPath]: neededProps,
      },
      skip: pagination.offset,
      take: pagination.limit,
    }

    if (ThroughEntity) {
      findOptions.relations = [throughKey as string]
    }

    return findOptions
  }

  /**
   * Compute and returns all the properties needed to sucessfully join this record with the supplied
   * relation.
   *
   * ie: For an EntityA linked to EntityB via the FK EntityA.entityBId -> EntityB.id, this will return :
   * ```{ "id": entityA.entityBId }```
   * @param record instance of EntityA to hydrate the return
   * @param relation relation we want to create the where for
   */
  protected _neededPropsForJoin (record: Record<string, unknown>, relation: RelationMetadata) {
    // Construct the object of properties we need in our where. (ie: join column names)
    return relation.joinColumns.reduce((needed, column) => {
      if (!column.referencedColumn) return needed
      needed[column.referencedColumn.propertyName] = record[column.referencedColumn.propertyName]
      return { ...needed }
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    }, {} as { [key: string]: unknown })
  }

  /**
   * For a given Entity linked to a Through table for a N:M relation,
   * find the name of the property pointing to Entity on Through
   *
   * ie: Through.entity
   * @param Entity the target entity type
   * @param Through the through entity type
   */
  protected _findPropertyNameBetweenEntityAndThrough (Entity: Function, Through?: Function): string {
    if (!Through) { return '' }
    const metadatas = getConnection().getMetadata(Through)
    const relation = metadatas.relations
      .find((rel) => (rel.type as Function).name === Entity.name)

    if (!relation) {
      throw new Error(`Couldn't find relation between ${Entity.name} and ${Through.name}`)
    }

    return relation.propertyName
  }

  /**
   * Find TypeORM's metadata and relation between an entity and another, possibly through a join entity
   *
   * @param propertyKey name of the property on Self pointing to entity
   * @param Entity target entity type
   * @param Self  self entity type
   * @param Through optional join entity type
   */
  protected _getMedataAndRelationForEntity (propertyKey: string, Entity: Function, Self: Function, Through?: Function): { metadatas: EntityMetadata; relation: RelationMetadata } {
    const isManyToMany = Boolean(Through)
    const metadatas = getConnection().getMetadata(isManyToMany ? Through as Function : Entity)

    let relation = metadatas.relations
      .find((rel) => rel.inverseRelation && rel.inverseRelation.propertyName === propertyKey)

    if (!relation) {
      relation = metadatas.relations
        .find((rel) => (rel.type as Function).name === Self.constructor.name)
    }

    if (!relation) {
      throw new Error(`Couldn't find relation between ${Self.constructor.name} and ${isManyToMany ? (Through as Function).name : Entity.name} `)
    }

    return { metadatas, relation }
  }
}
