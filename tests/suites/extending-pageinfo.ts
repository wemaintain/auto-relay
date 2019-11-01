import { GraphQLSchema } from "graphql";
import { Container } from "typedi";
import { ApolloServerTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

export function ExtendingPageInfo(suiteName: string) {
  let testClient: ApolloServerTestClient;

  beforeAll(() => {
    testClient = Container.get('testServer');
  })

  describe(`Extending PageInfo`, () => {
    it('Fields on extended pageinfo should work with tgql decorators', async () => {
      const test = await testClient.query({
        query: `query { 
          getAllUsersPaginated(first: 5) { pageInfo { hasNextPage, decoratorTest } } 
        }
        `
      })

      expect(test.errors).toBeFalsy()
    })
  })
}