import { AutoRelayConfig } from './../src/services/auto-relay-config.service';
import { DynamicObjectFactory } from './../src/graphql/dynamic-object.factory';
import * as TGQL from "type-graphql"
import { SharedObjectFactory } from "../src/graphql/shared-object.factory";
import { ObjectTypeDefinitionNode, GraphQLNamedType, GraphQLObjectType, GraphQLSchema } from "graphql";
import { getMetadataStorage } from "type-graphql/dist/metadata/getMetadataStorage"
import { getFieldOfObjectType, getConfigOfObjectType } from "./_.helper";
import Container from 'typedi';
import { ClassType } from 'type-graphql';

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
  let declarations: { TestResolver: ClassType, TestObject: ClassType; TestLinkedObject: ClassType; TestLinkedThroughObject: ClassType; }
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
        dynamicObjectFactory.getEdgeConnection(() => declarations.TestLinkedObject)
        const schema = await buildSchema();

        const type = getConfigOfObjectType(schema, 'TestLinkedObjectEdge');

        expect(type).toBeTruthy();
        expect(type.name).toEqual('TestLinkedObjectEdge');
      })

      it('Should have valid Edge Object', async () => {
        dynamicObjectFactory.getEdgeConnection(() => declarations.TestLinkedObject)
        const schema = await buildSchema();

        validateSchemaOfBasicEdge(schema, 'TestLinkedObjectEdge', declarations.TestLinkedObject);
      })

      it('Should have valid Augmented Edge Object', async () => {
        dynamicObjectFactory.getEdgeConnection(() => declarations.TestLinkedObject, () => declarations.TestLinkedThroughObject as any)
        const schema = await buildSchema();

        validateSchemaOfBasicEdge(schema, 'TestLinkedThroughObjectTestLinkedObjectEdge', declarations.TestLinkedObject);

        const type = getConfigOfObjectType(schema, 'TestLinkedThroughObjectTestLinkedObjectEdge');
        const foo = getFieldOfObjectType(schema, type, 'foo');


        validateSchemaOfBasicEdge(schema, 'TestLinkedThroughObjectTestLinkedObjectEdge', declarations.TestLinkedObject);
        expect(() => getFieldOfObjectType(schema, type, 'bar')).toThrow(/bar doesn't exist/)
        expect(foo.type.toString()).toEqual('String!')
      })
    })

    describe('Connection', () => {
      it('Should create a connection Object', async () => {
        dynamicObjectFactory.getEdgeConnection(() => declarations.TestLinkedObject)
        const schema = await buildSchema();

        const type = getConfigOfObjectType(schema, 'TestLinkedObjectConnection');

        expect(type).toBeTruthy();
        expect(type.name).toEqual('TestLinkedObjectConnection');
      })

      it('Should have valid Connection Object', async () => {
        dynamicObjectFactory.getEdgeConnection(() => declarations.TestLinkedObject)
        const schema = await buildSchema();

        const type = getConfigOfObjectType(schema, 'TestLinkedObjectConnection');

        const pageInfo = getFieldOfObjectType(schema, type, 'pageInfo');
        const edges = getFieldOfObjectType(schema, type, 'edges');

        expect(pageInfo.type.toString()).toEqual('PageInfo!');
        expect(edges.type.toString()).toEqual('[TestLinkedObjectEdge!]!');
      })
      
    })

  })
})