import { Resolver, Query, Arg, InputType, Field } from 'type-graphql';
import { TestObject } from '../entities/test';
import { RelayedQuery, RelayedFieldResolver } from 'auto-relay';
import { TestNestedObject } from '../entities/test-nested';

@InputType()
export class NestedObjectInput {
  @Field()
  testArg!: boolean
}

@Resolver(() => TestObject)
export class TestResolver {

  @RelayedQuery(() => TestObject, { paginationInputType: true })
  public async testInputTypeArgs(): Promise<[number, TestObject[]]> {
    return [1, [new TestObject()]];
  }

  @RelayedQuery(() => TestObject, { paginationInputType: 'testName' })
  public async testNamedInputTypeArgs(): Promise<[number, TestObject[]]> {
    return [1, [new TestObject()]];
  }

  @Query(() => [TestObject])
  public testObjects() {
    return Array(10).fill(null).map(() => new TestObject())
  }

  @RelayedFieldResolver(() => TestNestedObject, { paginationInputType: true })
  public async nestedObject(
    @Arg('args') { testArg }: NestedObjectInput
  ): Promise<[ number, TestNestedObject[]]> {
    return [10, Array(10).fill(null).map(() => new TestNestedObject()) ]   
  }

}