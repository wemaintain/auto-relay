import { Field, ID, ObjectType } from 'type-graphql'
import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from "typeorm"
import { Recipe } from './recipe';
import { RelayedConnection } from 'auto-relay';

@ObjectType()
@Entity()
export class User {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Field()
  @Column()
  email!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  nickname?: string;

  @Column()
  password!: string;

  @OneToMany(() => Recipe, recipe => recipe.author)
  @RelayedConnection(() => Recipe)
  recipes!: Recipe[]
}