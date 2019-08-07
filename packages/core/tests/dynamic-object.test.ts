import { AutoRelayConfig } from './../src/services/auto-relay-config.service';
import { DynamicObjectFactory } from './../src/graphql/dynamic-object.factory';
import * as TGQL from "type-graphql"
import { SharedObjectFactory } from "../src/graphql/shared-object.factory";
import { ObjectTypeDefinitionNode, GraphQLNamedType, GraphQLObjectType, GraphQLSchema } from "graphql";
import { getMetadataStorage } from "type-graphql/dist/metadata/getMetadataStorage"
import { getFieldOfObjectType, getConfigOfObjectType } from "./_.helper";
import Container from 'typedi';

const basicSchema = () => {
  @TGQL.ObjectType()
  class TestObject {
    @TGQL.Field(t => TGQL.ID)
    id: string = "abc"
  }

  @TGQL.ObjectType()
  class TestLinkedObject {
    @TGQL.Field(t => TGQL.ID)
    id: string = "def"
  }

  @TGQL.ObjectType()
  class TestLinkedThroughObject {
    @TGQL.Field(t => TGQL.ID)
    id: string = "def"

    @TGQL.Field(() => String)
    foo = "foo"

    bar = "bar"
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

  return { TestObject, TestResolver, TestLinkedObject, TestLinkedThroughObject }
}


describe('SDL Integration', () => {
  let declarations: { TestResolver: Function, TestObject: Function; TestLinkedObject: Function; TestLinkedThroughObject: Function; }
  let resolvers: any[] = [];
  let dynamicObjectFactory = new DynamicObjectFactory()
  const buildSchema = async () => {
    return TGQL.buildSchema({
      resolvers,
      skipCheck: true,
    });
  }


  beforeEach(() => {
    declarations = basicSchema();
    resolvers = [declarations.TestResolver];
    dynamicObjectFactory = new DynamicObjectFactory();
    const config = new AutoRelayConfig({
      orm: jest.fn()
    })
  })

  afterEach(() => {
    getMetadataStorage().clear();
  })

  describe('Dynamic Objects', () => {

    describe('Edge', () => {

      const validateSchemaOfBasicEdge = (schema: GraphQLSchema, edgeName: string, toType: Function) => {
        const type = getConfigOfObjectType(schema, edgeName);

        const cursor = getFieldOfObjectType(schema, type, 'cursor');
        const node = getFieldOfObjectType(schema, type, 'node');

        expect(cursor.type.toString()).toEqual('String!');
        expect(node.type.toString()).toEqual('TestLinkedObject!');
      }

      it('Should create basic Edge', async () => {
        dynamicObjectFactory.makeEdgeConnection('AToB', () => declarations.TestLinkedObject)
        const schema = await buildSchema();

        const type = getConfigOfObjectType(schema, 'AToBEdge');

        expect(type).toBeTruthy();
        expect(type.name).toEqual('AToBEdge');
      })

      it('Should have valid Edge Object', async () => {
        dynamicObjectFactory.makeEdgeConnection('AToB', () => declarations.TestLinkedObject)
        const schema = await buildSchema();

        validateSchemaOfBasicEdge(schema, 'AToBEdge', declarations.TestLinkedObject);
      })

      it('Should have valid Augmented Edge Object', async () => {
        dynamicObjectFactory.makeEdgeConnection('AToBThrough', () => declarations.TestLinkedObject, () => declarations.TestLinkedThroughObject as any)
        const schema = await buildSchema();

        validateSchemaOfBasicEdge(schema, 'AToBThroughEdge', declarations.TestLinkedObject);

        const type = getConfigOfObjectType(schema, 'AToBThroughEdge');
        const foo = getFieldOfObjectType(schema, type, 'foo');


        validateSchemaOfBasicEdge(schema, 'AToBThroughEdge', declarations.TestLinkedObject);
        expect(() => getFieldOfObjectType(schema, type, 'bar')).toThrow(/bar doesn't exist/)
        expect(foo.type.toString()).toEqual('String!')
      })
    })

    describe('Connection', () => {
      it('Should create a connection Object', async () => {
        dynamicObjectFactory.makeEdgeConnection('AToB', () => declarations.TestLinkedObject)
        const schema = await buildSchema();

        const type = getConfigOfObjectType(schema, 'AToBConnection');

        expect(type).toBeTruthy();
        expect(type.name).toEqual('AToBConnection');
      })

      it('Should have valid Connection Object', async () => {
        dynamicObjectFactory.makeEdgeConnection('AToB', () => declarations.TestLinkedObject)
        const schema = await buildSchema();

        const type = getConfigOfObjectType(schema, 'AToBConnection');

        const pageInfo = getFieldOfObjectType(schema, type, 'pageInfo');
        const edges = getFieldOfObjectType(schema, type, 'edges');

        expect(pageInfo.type.toString()).toEqual('PageInfo!');
        expect(edges.type.toString()).toEqual('[AToBEdge!]!');
      })
      
    })

  })
})