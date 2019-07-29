import * as TGQL from "type-graphql"
import { SharedObjectFactory } from "../src/graphql/shared-object.factory";
import { ObjectTypeDefinitionNode, GraphQLNamedType } from "graphql";
import { getMetadataStorage } from "type-graphql/dist/metadata/getMetadataStorage"

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


describe.only('SDL Integration', () => {

  let resolvers: any[] = [];
  let sharedObjectFactory = new SharedObjectFactory()
  const buildSchema = async () => {
    return TGQL.buildSchema({
      resolvers,
      skipCheck: true,
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
        const schema = await buildSchema();

        const pageInfoType = schema.getType('PageInfo');
        if (!pageInfoType) throw new Error(`Couldn't find Object in SDL`);

        expect(pageInfoType.name).toBe('PageInfo');
      })

      it('Should create a PageInfo Object with prefix in the SDL', async () => {
        const PageInfo = sharedObjectFactory.generatePageInfo('AHA');
        const schema = await buildSchema();

        const pageInfoType = schema.getType('AHAPageInfo');
        if (!pageInfoType) throw new Error(`Couldn't find Object in SDL`);

        expect(pageInfoType.name).toBe('AHAPageInfo');
      })

      it('Should have hasNextPage: Boolean!', async () => {
        const PageInfo = sharedObjectFactory.generatePageInfo('');
        const schema = await buildSchema();

        const pageInfoType = schema.getType('PageInfo');
        if (!pageInfoType) throw new Error(`Couldn't find Object in SDL`);
        const node = pageInfoType.toJSON();

        console.log(node);

        // if (!node || !node.fields) throw new Error(`Couldn't find node in SDL`);
        // const hasNextPage = node.fields.find(f => f.name.value === 'hasNextPage');

        // console.log(hasNextPage);
        // expect(hasNextPage).toBeTruthy();
      })
    })
  })
})