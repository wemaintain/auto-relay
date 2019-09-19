import { ObjectType, Field, Int, ID } from 'type-graphql'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"
import { User } from "./user";
import { Recipe } from "./recipe";

@Entity()
@ObjectType()
export class Rate {
  @PrimaryGeneratedColumn()
  @Field(type => ID)
  readonly id!: number;

  @Field(type => Int)
  @Column({ type: "int" })
  value!: number;

  @Field(type => User, { nullable: true })
  @ManyToOne(type => User, { nullable: true })
  user!: User;

  @Field()
  @CreateDateColumn()
  date!: Date;

  @ManyToOne(type => Recipe)
  recipe!: Recipe;
}
