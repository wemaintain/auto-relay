import { ObjectType, Field, ID } from 'type-graphql'
import * as faker from 'faker'

@ObjectType()
export class TestNestedObject {

  @Field(() => ID)
  public id:string = faker.datatype.uuid()

  @Field()
  public foo: string = faker.random.words()

  @Field()
  public bar: string = faker.random.words()

}

@ObjectType()
export class TestNestedThroughObject {

  @Field(() => ID)
  public id:string = faker.datatype.uuid()

  @Field()
  public nested: TestNestedObject = new TestNestedObject()

  @Field()
  public bar: string = faker.random.words()

}
