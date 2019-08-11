import { GraphQLSchema } from "graphql";
import { Container } from "typedi";
import { ApolloServerTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

export function RelayedQueryTests(suiteName: string) {
  let testClient: ApolloServerTestClient;

  beforeAll(() => {
    testClient = Container.get('testServer');
  })

  describe(`${suiteName} RelayedQuery`, () => {
    it('Should work without errors on a query', async () => {
      const test = await testClient.query({
        query: `query { 
          getAllUsersPaginated(first: 5) { pageInfo{hasNextPage} } 
        }
        `
      })

      expect(test.errors).toBeUndefined()
    })
  })
}