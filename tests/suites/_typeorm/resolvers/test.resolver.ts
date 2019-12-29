import { Resolver, Query, Arg, InputType, Field } from 'type-graphql';
import { TestObject } from '../entities/test';
import { RelayedQuery, RelayedFieldResolver, EntityWithCounts } from 'auto-relay';
import { TestNestedObject } from '../entities/test-nested';

@InputType()
export class NestedObjectInput {
  @Field()
  testArg!: boolean
}

@Resolver(() => TestObject)
export class TestResolver {

  @RelayedQuery(() => TestObject, { paginationInputType: true })
  public async testInputTypeArgs() {
    return [1, [new TestObject()]] as [number, TestObject[]];
  }

  @RelayedQuery(() => TestObject, { paginationInputType: 'testName' })
  public async testNamedInputTypeArgs() {
    return [1, [new TestObject()]] as [number, TestObject[]];
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


  @RelayedQuery(() => TestObject, { paginationInputType: 'testName' })
  public async testTypeOrmReturnFormat() {
    return [[new TestObject()], 5] as [TestObject[], number];
  }

  @RelayedQuery(() => TestObject, { paginationInputType: 'testName' })
  public async testSequelizeReturnFormat(): Promise<EntityWithCounts<TestObject>> {
    return {
      count: 2,
      rows: [new TestObject()],
    }
  }

}