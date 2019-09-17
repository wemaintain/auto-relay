import { ObjectType, Field, ID } from "type-graphql"
import * as faker from 'faker'

@ObjectType()
export class TestNestedObject {
  @Field(() => ID)
  id:string = faker.random.uuid()

  @Field()
  foo: string = faker.random.words()
  
  @Field()
  bar: string = faker.random.words()

}