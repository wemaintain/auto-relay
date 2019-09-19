import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql';
import { Rate } from './rate';
import { User } from './user';
import { RelayedConnection } from 'auto-relay';

@Entity()
@ObjectType()
export class Recipe {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Field()
  @Column()
  title!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  
  @OneToMany(type => Rate, rate => rate.recipe)
  @RelayedConnection(() => Rate)
  ratings!: Rate[];

  @RelayedConnection(() => Rate, { order: { value: "DESC" } })
  ratingsByValue!: Rate[]

  @Field(type => User)
  @ManyToOne(type => User, { nullable: true })
  author?: User;
}