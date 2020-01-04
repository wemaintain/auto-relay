import { RelayedQuery } from 'auto-relay'
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'
import { Resolver, ObjectType, Field, ID, Query } from "type-graphql"
import { Sortable } from '@auto-relay/sorting'
import { OrderOptions, TypeORMOrdering } from '@auto-relay/typeorm'

@Entity()
@ObjectType()
export class SortableEntity extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  public id!: string

  @Field()
  @Column({ default: () => "RANDOM()"})
  public sortingFoo!: number

  @Field()
  @Column({ default: () => "RANDOM()"})
  public sortingBar!: number

  @Field(() => Number)
  public get sortingComputed(): number {
    return this.sortingFoo / this.sortingBar
  }

}

@Resolver(() => SortableEntity)
export class SortingResolver {

  constructor() {
    // Array.of(50).map(() => SortableEntity.insert({}))
  }

  @Query(() => String)
  @Sortable(() => SortableEntity)
  public async sortableEntities(
    @OrderOptions() order: TypeORMOrdering
  ) {
    return JSON.stringify(order)
  }

  @RelayedQuery(() => SortableEntity)
  public async sortableEntitiesRelayed() {
    return SortableEntity.findAndCount({})
  }

}