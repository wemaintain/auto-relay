import { GraphQLSchema } from "graphql";
import { Container } from "typedi";
import { ApolloServerTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

export function SortingTests(suiteName: string) {
  let testClient: ApolloServerTestClient;

  beforeAll(() => {
    testClient = Container.get('testServer');
  })

  describe(`Sorting`, () => {
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