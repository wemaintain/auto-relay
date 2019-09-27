import { ObjectType, Field, ID } from "type-graphql";
import * as faker from 'faker'
import { TestNestedObject } from "./test-nested";
import { RelayedConnection } from "auto-relay";

@ObjectType()
export class TestObject {
  
  @Field(() => ID)
  id:string = faker.random.uuid()

  @Field()
  foo: string = faker.random.words()
  
  @Field()
  bar: string = faker.random.words()

  @RelayedConnection(() => TestNestedObject, { order: { id: "DESC" }, field: { description: "test" } })
  public relayedConnectionWithOptions! : TestNestedObject[]
  
  protected nestedObject!: TestNestedObject[]
}