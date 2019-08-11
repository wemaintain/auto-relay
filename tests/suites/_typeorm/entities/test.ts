import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class TestObject {
  @Field(() => ID)
  id!:number;

  @Field()
  foo!: string;
  
  @Field()
  bar!: string;
}