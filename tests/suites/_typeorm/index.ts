import { Container } from 'typedi';
import { UserResolver } from './resolvers/user.resolver'
import { User } from './entities/user'
import { createConnection, getConnection } from 'typeorm'
import { Recipe } from './entities/recipe'
import { Rate } from './entities/rate'
import { buildSchema } from 'type-graphql'
import { TestResolver } from './resolvers/test.resolver'
import { ApolloServer } from 'apollo-server'
import { createTestClient } from 'apollo-server-testing'
import { RecipeResolver } from './resolvers/recipe.resolver'
import { SortableEntity, SortingResolver } from './sorting'
import { TestObject3 } from './entities/test';

export async function setUpTypeORM() {
  try {
    await getConnection().close();
  } catch (e) { }

  await createConnection({
    type: 'sqlite',
    database: ":memory:",
    synchronize: true,
    dropSchema: true,
    entities: [User, Recipe, Rate, SortableEntity]
  })
  await UserResolver.seed()
try {
  const schema = await buildSchema({
    resolvers: [UserResolver, TestResolver, RecipeResolver, SortingResolver],
    orphanedTypes: [TestObject3],
  })

  const server = new ApolloServer({
    schema
  });

  const testServer = createTestClient(server);
  await server.listen({ port: 33333 });

  Container.set('schema', schema)
  Container.set('server', server);
  Container.set('testServer', testServer)

  expect(schema).toBeTruthy()
  expect(server).toBeTruthy()
  expect(testServer).toBeTruthy()
} catch(e) {
  console.error("EEEE", e)
  throw e;
}

  return;
} 