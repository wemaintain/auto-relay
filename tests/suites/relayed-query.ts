import { GraphQLSchema } from "graphql";
import { Container } from "typedi";
import { ApolloServerTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

export function RelayedQueryTests(suiteName: string) {
  let testClient: ApolloServerTestClient;

  beforeAll(() => {
    testClient = Container.get('testServer');
  })

  describe(`RelayedQuery`, () => {
    
    it('Should work without errors on a query', async () => {
      const test = await testClient.query({
        query: `query { 
          getAllUsersPaginated(first: 5) { pageInfo{hasNextPage} } 
        }
        `
      })

      expect(test.errors).toBeUndefined()
    })

    describe('PageInfo', () => {

      describe('With biDirectional', () => {
        it('Should compute hasPreviousPage', async () => {
          const test = await testClient.query({
            query: `query { 
              getAllUsersPaginatedBiDirectional(first: 5) { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
            }
            `
          })
  
          expect(test.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasPreviousPage).toBeFalse()
  
          const test2 = await testClient.query({
            query: `query { 
              getAllUsersPaginatedBiDirectional(first: 5, after: "${test.data!.getAllUsersPaginatedBiDirectional.pageInfo.endCursor}") { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
            }
            `
          })
  
          expect(test2.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasPreviousPage).toBeTrue()
        })
  
        it('Should compute hasNextPage', async () => {
          const testAll = await testClient.query({
            query: `query { 
              getAllUsersPaginatedBiDirectional { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
            }
            `
          })
          expect(testAll.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasNextPage).toBeFalse()
  
          const test = await testClient.query({
            query: `query { 
              getAllUsersPaginatedBiDirectional(first: 5) { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
            }
            `
          })
  
          expect(test.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasNextPage).toBeTrue()
  
          const test2 = await testClient.query({
            query: `query { 
              getAllUsersPaginatedBiDirectional(first: 5, after: "${testAll.data!.getAllUsersPaginatedBiDirectional.pageInfo.endCursor}") { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
            }
            `
          })
  
          expect(test2.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasPreviousPage).toBeTrue()
        })
      })

      describe('vanilla', () => {
        it('Should compute hasPreviousPage', async () => {
          const test = await testClient.query({
            query: `query { 
              getAllUsersPaginated(first: 5) { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
            }
            `
          })
  
          expect(test.data!.getAllUsersPaginated.pageInfo.hasPreviousPage).toBeFalse()
  
          const test2 = await testClient.query({
            query: `query { 
              getAllUsersPaginated(first: 5, after: "${test.data!.getAllUsersPaginated.pageInfo.endCursor}") { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
            }
            `
          })
  
          expect(test2.data!.getAllUsersPaginated.pageInfo.hasPreviousPage).toBeFalse()
        })
  
        it('Should compute hasNextPage', async () => {
          const testAll = await testClient.query({
            query: `query { 
              getAllUsersPaginated { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
            }
            `
          })
  
          expect(testAll.data!.getAllUsersPaginated.pageInfo.hasNextPage).toBeFalse()
  
          const test = await testClient.query({
            query: `query { 
              getAllUsersPaginated(first: 5) { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
            }
            `
          })
  
          expect(test.data!.getAllUsersPaginated.pageInfo.hasNextPage).toBeTrue()
        })
      })



    })

  })
}