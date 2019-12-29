import { RelayedQuery } from 'auto-relay';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { Resolver, ObjectType, Field, ID, Query } from "type-graphql";
import { Sortable } from '@auto-relay/sorting';

@Entity()
@ObjectType()
export class SortableEntity extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  public id!: string

  @Field()
  @Column({ default: () => "RANDOM()"})
  public foo!: number

  @Field()
  @Column({ default: () => "RANDOM()"})
  public bar!: number

  @Field(() => Number)
  public get computed(): number {
    return this.foo / this.bar
  }

}

@Resolver(() => SortableEntity)
export class SortingResolver {

  constructor() {
    // Array.of(50).map(() => SortableEntity.insert({}))
  }

  @Query(() => [SortableEntity])
  // @Sortable(() => SortableEntity)
  public async sortableEntities() {
    return SortableEntity.find({})
  }

  @RelayedQuery(() => SortableEntity)
  public async sortableEntitiesRelayed() {
    return SortableEntity.findAndCount({})
  }

}