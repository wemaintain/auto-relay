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

        describe('Forwards paging', () => {

          it('Should have valid PageInfo on first page', async () => {
            const test = await testClient.query({
              query: `query { 
                getAllUsersPaginatedBiDirectional(first: 5) { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
              }
              `
            })
    
            expect(test.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasPreviousPage).toBeFalse()
            expect(test.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasNextPage).toBeTrue()
          })

          it('Should have valid PageInfo on nth pages', async () => {
            const firstPage = await testClient.query({
              query: `query { 
                getAllUsersPaginatedBiDirectional(first: 5) { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
              }
              `
            });

            const test = await testClient.query({
              query: `query { 
                getAllUsersPaginatedBiDirectional(first: 5, after: "${firstPage.data!.getAllUsersPaginatedBiDirectional.pageInfo.endCursor}") { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
              }
              `
            })
            expect(test.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasPreviousPage).toBeTrue()
            expect(test.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasNextPage).toBeTrue()



            const test2 = await testClient.query({
              query: `query { 
                getAllUsersPaginatedBiDirectional(first: 5, after: "${test.data!.getAllUsersPaginatedBiDirectional.pageInfo.endCursor}") { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
              }
              `
            })
            expect(test2.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasPreviousPage).toBeTrue()
            expect(test.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasNextPage).toBeTrue()
          })

          xit('Should have valid PageInfo on last page', async () => {
          })

          it('Should have valid PageInfo on no pages', async () => {
            const test = await testClient.query({
              query: `query { 
                getAllUsersPaginatedBiDirectional(first: 1000) { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
              }
              `
            })
            expect(test.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasPreviousPage).toBeFalse()
            expect(test.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasNextPage).toBeFalse()
          })

        })


        describe('Backwards paging', () => {

          // last with no cursor not implemented yet
          let lastCursor: string;

          beforeEach(async () => {
            const { data, errors } = await testClient.query({
              query: `query { 
                getAllUsersPaginatedBiDirectional { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
              }
              `
            })

            lastCursor = data!.getAllUsersPaginatedBiDirectional.pageInfo.endCursor
          })

          it('Should have valid PageInfo on first page', async () => {
            const test = await testClient.query({
              query: `query { 
                getAllUsersPaginatedBiDirectional(last: 5, before: "${lastCursor}") { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
              }
              `
            })

            expect(test.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasPreviousPage).toBeTrue()
            expect(test.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasNextPage).toBeFalse()
          })

          it('Should have valid PageInfo on nth pages', async () => {
            const firstPage = await testClient.query({
              query: `query { 
                getAllUsersPaginatedBiDirectional(last: 5, before: "${lastCursor}") { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
              }
              `
            });

            const test = await testClient.query({
              query: `query { 
                getAllUsersPaginatedBiDirectional(last: 5, before: "${firstPage.data!.getAllUsersPaginatedBiDirectional.pageInfo.startCursor}") { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
              }
              `
            })
            expect(test.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasPreviousPage).toBeTrue()
            expect(test.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasNextPage).toBeTrue()



            const test2 = await testClient.query({
              query: `query { 
                getAllUsersPaginatedBiDirectional(last: 5, before: "${test.data!.getAllUsersPaginatedBiDirectional.pageInfo.startCursor}") { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
              }
              `
            })
            expect(test2.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasPreviousPage).toBeTrue()
            expect(test.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasNextPage).toBeTrue()
          })

          it('Should have valid PageInfo on last page', async () => {
          })

          it('Should have valid PageInfo on no pages', async () => {
            const test = await testClient.query({
              query: `query { 
                getAllUsersPaginatedBiDirectional(last: 1000, before: "${lastCursor}") { pageInfo{hasPreviousPage, hasNextPage, startCursor, endCursor} } 
              }
              `
            })
            expect(test.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasPreviousPage).toBeFalse()
            expect(test.data!.getAllUsersPaginatedBiDirectional.pageInfo.hasNextPage).toBeFalse()
          })

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