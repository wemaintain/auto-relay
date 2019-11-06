import { Container } from "typedi";
import { ApolloServerTestClient } from "apollo-server-testing";

export function ExtendingPageInfo(suiteName: string) {
  let testClient: ApolloServerTestClient;

  beforeAll(() => {
    testClient = Container.get('testServer');
  })

  describe(`Extending Shared Types`, () => {
    describe('PageInfo', () => {
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

      describe('Connection', () => {
        it('Fields on extended Connection should work with tgql decorators', async () => {
          const test = await testClient.query({
            query: `query { 
              getAllUsersPaginated(first: 5) { decoratorTest, pageInfo { hasNextPage } } 
            }`
          })
    
          expect(test.errors).toBeFalsy()
        })
      })
    })
}