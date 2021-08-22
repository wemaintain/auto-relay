import { ObjectType, Field, ID } from "type-graphql";
import * as faker from 'faker'
import { TestNestedObject, TestNestedThroughObject } from "./test-nested";
import { RelayedConnection, RelayedFieldResolver, RelayedField, AugmentedConnection } from "auto-relay";

@ObjectType()
export class TestObject {

  @Field(() => ID)
  id: string = faker.datatype.uuid()

  @Field()
  foo: string = faker.random.words()

  @Field()
  bar: string = faker.random.words()

  @RelayedConnection(() => TestNestedObject, { order: { id: "DESC" }, field: { description: "test" } })
  public relayedConnectionWithOptions!: TestNestedObject[]

  @RelayedField(() => TestObject2)
  testRelayedFieldOnly!: AugmentedConnection<TestObject2>

}

@ObjectType()
export class TestObject2 {

  @Field(() => ID)
  id: string = faker.datatype.uuid()

  @RelayedConnection(() => TestNestedObject)
  public connection!: TestNestedObject[]

  @RelayedConnection(() => TestNestedObject, () => TestNestedThroughObject)
  public connectionThrough!: TestNestedObject[]

}

@ObjectType()
export class TestObject3 {

  @Field(() => ID)
  id: string = faker.datatype.uuid()

  @RelayedConnection(() => TestNestedObject)
  public connection!: TestNestedObject[]

  @RelayedConnection(() => TestNestedObject, () => TestNestedThroughObject)
  public connectionThrough!: TestNestedObject[]

}