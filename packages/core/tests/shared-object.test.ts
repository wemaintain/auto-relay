import * as TGQL from "type-graphql"
import { SharedObjectFactory } from "../src/graphql/shared-object.factory";
import { ObjectTypeDefinitionNode, GraphQLNamedType, GraphQLObjectType } from "graphql";
import { getMetadataStorage } from "type-graphql/dist/metadata/getMetadataStorage"
import { getFieldOfObjectType, getConfigOfObjectType } from "./_.helper";

const basicSchema = () => {
  @TGQL.ObjectType()
  class TestObject {
    @TGQL.Field(t => TGQL.ID)
    id: string = "abc"
  }

  @TGQL.Resolver(() => TestObject)
  class TestResolver {
    // @TGQL.Query()
    getObject() {
      const t = new TestObject();
      t.id = "abc";

      return t;
    }
  }

  return { TestObject, TestResolver }
}


describe('SDL Integration', () => {

  let resolvers: Function[] = [];
  let sharedObjectFactory = new SharedObjectFactory()
  const buildSchema = async (...types: Function[]) => {
    return TGQL.buildSchema({
      resolvers: resolvers as [Function, ...Function[]],
      skipCheck: true,
      orphanedTypes: types
    });
  }

  beforeAll(() => {
    const { TestResolver } = basicSchema();
    resolvers = [TestResolver];
  })

  beforeEach(() => {
    sharedObjectFactory = new SharedObjectFactory();
  })

  afterEach(() => {
    getMetadataStorage().clear();
  })

  describe('Shared Objects', () => {
    describe('PageInfo', () => {
      it('Should create a PageInfo Object in the SDL', async () => {
        const PageInfo = sharedObjectFactory.generatePageInfo('');
        const schema = await buildSchema(PageInfo);

        const pageInfoType = schema.getType('PageInfo');
        if (!pageInfoType) throw new Error(`Couldn't find Object in SDL`);

        expect(pageInfoType.name).toBe('PageInfo');
      })

      it('Should create a PageInfo Object with prefix in the SDL', async () => {
        const PageInfo = sharedObjectFactory.generatePageInfo('AHA');
        const schema = await buildSchema(PageInfo);

        const pageInfoType = schema.getType('AHAPageInfo');
        if (!pageInfoType) throw new Error(`Couldn't find Object in SDL`);

        expect(pageInfoType.name).toBe('AHAPageInfo');
      })

      it('Should have valid PageInfo object', async () => {
        const PageInfo = sharedObjectFactory.generatePageInfo('');
        const schema = await buildSchema(PageInfo);

        const config = getConfigOfObjectType(schema, 'PageInfo')
        const hasNextPage = getFieldOfObjectType(schema, config, 'hasNextPage')
        const hasPreviousPage = getFieldOfObjectType(schema, config, 'hasPreviousPage')
        const startCursor = getFieldOfObjectType(schema, config, 'startCursor')
        const endCursor = getFieldOfObjectType(schema, config, 'endCursor')

        expect(hasNextPage.type.toString()).toEqual('Boolean!')
        expect(hasPreviousPage.type.toString()).toEqual('Boolean!')
        expect(startCursor.type.toString()).toEqual('String')
        expect(endCursor.type.toString()).toEqual('String')
      })
    })
  })
})