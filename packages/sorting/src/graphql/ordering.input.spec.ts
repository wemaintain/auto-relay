import { registerEnumType } from 'type-graphql'
import { PREFIX } from 'auto-relay'
import { Container } from 'typedi'
import { getMetadataStorage } from 'type-graphql/dist/metadata/getMetadataStorage'
import { buildSchema } from 'type-graphql'
import { orderingValueGQLFactory, OrderingDirection, NullsOrdering } from './ordering.input'
import { GraphQLInputField } from 'graphql'

describe('OrderingInput', () => {
  beforeEach(() => {
    getMetadataStorage().clear()
    Container.reset()
    registerEnumType(OrderingDirection, {
      name: "OrderingDirection",
      description: "Direction when sorting a column",
    });
    registerEnumType(NullsOrdering, {
      name: "NullsOrdering",
      description: "When sorting a nullable field, possible values on how to sort those null values"
    })
  })

  it("Should create an InputType with supplied infos", async () => {
    Container.set(PREFIX, "Testabc")
    const testEnum = {
      foo: "foo",
      bar: "bar"
    }

    registerEnumType(testEnum, { name: "TestEnum" })
    orderingValueGQLFactory('MyType', testEnum)

    const schema = await buildSchema({
      resolvers: [{} as any],
      skipCheck: true,
    })
    const test = schema.getType(`TestabcMyTypeOrderOptions`)!.toConfig()

    expect(test.name).toEqual("TestabcMyTypeOrderOptions")
    const direction: GraphQLInputField = (test as any).fields.direction
    const sort: GraphQLInputField = (test as any).fields.sort
    const nulls: GraphQLInputField = (test as any).fields.nulls

    expect(direction.type.toString()).toEqual("OrderingDirection")
    expect(direction.defaultValue.toString()).toEqual("ASC")

    expect(sort.type.toString()).toEqual("TestEnum!")

    expect(nulls.type.toString()).toEqual("NullsOrdering")
  })

  it('Should re-use ordering if already exists', async () => {
    Container.set(PREFIX, "Testabc")
    const testEnum = {
      foo: "foo",
      bar: "bar"
    }

    registerEnumType(testEnum, { name: "TestEnum" })
    const test = orderingValueGQLFactory('MyType', testEnum)
    const test2 = orderingValueGQLFactory('MyType', testEnum)
    expect(test).toBe(test2)


    const schema = await buildSchema({
      resolvers: [{} as any],
      skipCheck: true,
    })

    const testSchema = schema.getType(`TestabcMyTypeOrderOptions`)!.toConfig()
    expect(testSchema).toBeDefined()
  })
})