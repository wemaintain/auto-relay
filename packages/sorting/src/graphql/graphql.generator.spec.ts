import { ORMConnection, ORM_CONNECTION } from 'auto-relay'
import { GQLSortingGenerator, AUTORELAY_ENUM_REVERSE_MAP } from './graphql.generator'
import { getMetadataStorage } from 'type-graphql/dist/metadata/getMetadataStorage'
import { FieldResolver, ClassType, Query, buildSchema, registerEnumType } from 'type-graphql'
import { Field, ObjectType, Resolver } from 'type-graphql'
import { TypeOrmConnection } from "@auto-relay/typeorm"
import { Container } from 'typedi'
import { OrderingDirection } from './ordering.input'
import { GraphQLEnumTypeConfig } from 'graphql'

jest.mock("@auto-relay/typeorm")
const createSchema = () => {
  const EntityA = class {}

  Field(() => Number)(EntityA.prototype, "foo")
  Field(() => Number)(EntityA.prototype, "bar")
  Field(() => Number, { name: "schemaName" })(EntityA.prototype, "nonSchemaName")
  ObjectType()(EntityA)

  const ResolverA = class {
   public async query() {
     return []
   }
  }
  
  FieldResolver(() => Number)(ResolverA.prototype, "computed", {})
  Query(() => [Number])(ResolverA.prototype, "query", {})
  Reflect.defineMetadata('design:paramtypes', [], ResolverA.prototype, 'query');
  Resolver(() => EntityA)(ResolverA)
  
  return { EntityA, ResolverA }
}

describe('GQLSortingGenerator', () => {
  let EntityA: ClassType
  let ResolverA: ClassType
  let generator: GQLSortingGenerator
  let ormConnection: jest.Mocked<ORMConnection>

  beforeEach(async () => {
    Container.reset()
    getMetadataStorage().clear()

    ormConnection = new TypeOrmConnection() as any
    Container.set(ORM_CONNECTION, ormConnection)
    registerEnumType(OrderingDirection, {
      name: "OrderingDirection",
      description: "Direction when sorting a column",
    });
    const schema = createSchema()
    EntityA = schema.EntityA
    ResolverA = schema.ResolverA

    generator = new GQLSortingGenerator()
  })

  it('Should do nothing if given type has no sortable columns', async () => {
    ormConnection.getColumnsOfFields.mockReturnValueOnce({ })
    generator.generateForType(EntityA, ResolverA.prototype, "query")

    const schema = await buildSchema({ resolvers: [{} as any], skipCheck: true })
    const test: GraphQLEnumTypeConfig = schema.getType('EntityASortableFields')?.toConfig() as any
    expect(test).toBeFalsy()
  })

  describe('Enum', () => {

    it('Should create an enum for the given type', async () => {
      ormConnection.getColumnsOfFields.mockReturnValueOnce({
        foo: "foo",
        bar: "bar" 
      })
      generator.generateForType(EntityA, ResolverA.prototype, "query")

      const schema = await buildSchema({ resolvers: [{} as any], skipCheck: true })
      const test: GraphQLEnumTypeConfig = schema.getType('EntityASortableFields')?.toConfig() as any

      expect(test).toBeTruthy()
      expect(test.values.foo).toBeTruthy()
      expect(test.values.bar).toBeTruthy()
    })

    it('Should have values of columns fields', async () => {
      ormConnection.getColumnsOfFields.mockReturnValueOnce({
        bar: "bar" 
      })
      generator.generateForType(EntityA, ResolverA.prototype, "query")

      const schema = await buildSchema({ resolvers: [{} as any], skipCheck: true })
      const test: GraphQLEnumTypeConfig = schema.getType('EntityASortableFields')?.toConfig() as any

      expect(test).toBeTruthy()
      expect(test.values.foo).toBeFalsy()
      expect(test.values.bar).toBeTruthy()
    })

    it('Should use schema names of fields', async () => {
      ormConnection.getColumnsOfFields.mockReturnValueOnce({
        nonSchemaName: "dbName" 
      })
      generator.generateForType(EntityA, ResolverA.prototype, "query")

      const schema = await buildSchema({ resolvers: [{} as any], skipCheck: true })
      const test: GraphQLEnumTypeConfig = schema.getType('EntityASortableFields')?.toConfig() as any

      expect(test).toBeTruthy()
      expect(test.values.nonSchemaName).toBeFalsy()
      expect(test.values.dbName).toBeFalsy()
      expect(test.values.schemaName).toBeTruthy()
    })

    it("Should decorate reverse map for further use", () => {
      ormConnection.getColumnsOfFields.mockReturnValueOnce({
        foo: "foo",
        bar: "bar" 
      })
      generator.generateForType(EntityA, ResolverA.prototype, "query")

      const test = Reflect.getMetadata(AUTORELAY_ENUM_REVERSE_MAP, ResolverA.prototype, "query")

      expect(test).toBeTruthy()
      expect(Array.isArray(test)).toBeTrue()
      expect(test).toContainAllValues([
        { name: "foo", schemaName: "foo", type: EntityA },
        { name: "bar", schemaName: "bar", type: EntityA },
      ])
    })

  })

  describe("Input", () => {

    it('Should add order input to decorater fresolver', async () => {
      ormConnection.getColumnsOfFields.mockReturnValueOnce({
        bar: "bar" 
      })
      generator.generateForType(EntityA, ResolverA.prototype, "query")

      const schema = await buildSchema({ resolvers: [{} as any], skipCheck: true })
      const query = schema.getQueryType()
      const test = query?.getFields().query
      
      expect(test).toBeTruthy()
      expect(test?.args[0].name).toEqual("order")
      expect(test?.args[0].type.toString()).toEqual("[EntityAOrderOptions!]")
    })

  })


})