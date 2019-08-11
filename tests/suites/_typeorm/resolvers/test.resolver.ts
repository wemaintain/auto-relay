import { Resolver, Query } from 'type-graphql';
import { TestObject } from '../entities/test';
import { RelayedQuery } from 'auto-relay';

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

}