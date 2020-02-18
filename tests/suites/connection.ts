import { Container } from "typedi"
import { ApolloServerTestClient } from "apollo-server-testing"
import { Recipe } from "./_typeorm/entities/recipe"
import { getConnection, EntityManager } from "typeorm"
import { Rate } from "./_typeorm/entities/rate"
import * as faker from 'faker'
import { User } from "./_typeorm/entities/user"

export function ConnectionTests(suiteName: string) {
  let testClient: ApolloServerTestClient
  let manager: EntityManager

  beforeAll(() => {
    testClient = Container.get('testServer');
    manager = getConnection().manager
  })

  describe(`Connection`, () => {
    beforeEach(async () => {
      for (let i = 0; i < 10; i++) {
        const recipe = manager.create(Recipe, {
          title: faker.random.words(),
          description: faker.random.words(),
        })

        await manager.save(recipe)

        for (let j = 0; j < 10; j++) {
          await manager.save(
            manager.create(Rate, {
              date: faker.date.recent(),
              value: faker.random.number({ min: 0, max: 10 }),
              recipe
            })
          )
        }
      }
    })

    afterEach(async () => {
      await manager.connection.synchronize()
    })

    describe('Ordering', () => {

      it('Should return everything in the collection sorted by DESC value', async () => {
        const test = await testClient.query({
          query: `query { 
            recipes {
              id,
              ratingsByValue {
                edges {
                  node {
                    id,
                    value
                  }
                }
              }
            }
          }
          `
        })

        expect(test.errors).toBeUndefined()

        for (let i = 0; i < test.data!.recipes.length; i++) {
          const recipe = test.data!.recipes[i]
          let lastValue = 11 // 11 > 10 which is our max rating
          recipe.ratingsByValue.edges.forEach(({ node }: { node: { id: string, value: string } }) => {
            expect(lastValue).toBeGreaterThanOrEqual(Number(node.value))
            lastValue = Number(node.value)
          })
        }
      })
    })
  })
}