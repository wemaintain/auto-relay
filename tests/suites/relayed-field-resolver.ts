import { GraphQLSchema } from "graphql";
import { Container } from "typedi";
import { ApolloServerTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

export function RelayedFieldResolverTests(suiteName: string) {
  let testClient: ApolloServerTestClient;

  beforeAll(() => {
    testClient = Container.get('testServer');
  })

  describe(`RelayedFieldResolver`, () => {
    it('Should allow pagination and args on a FieldResolver', async () => {
      const test = await testClient.query({
        query: `query { 
          testObjects { 
            nestedObject(pagination: { first: 5 }, args: { testArg: true }) {
              edges {
                node {
                  id
                }
              }
            }  
          } 
        }
        `
      })

      expect(test.errors).toBeUndefined()
    })
  })
}