import { registerEnumType } from 'type-graphql'
import { PREFIX } from 'auto-relay'
import { Container } from 'typedi'
import { getMetadataStorage } from 'type-graphql/dist/metadata/getMetadataStorage'
import { buildSchema } from 'type-graphql'
import { orderingValueGQLFactory, OrderingDirection } from './ordering.input'
import { GraphQLInputField } from 'graphql'

describe('OrderingInput', () => {
  beforeEach(() => {
    getMetadataStorage().clear()
    registerEnumType(OrderingDirection, {
      name: "OrderingDirection",
      description: "Direction when sorting a column",
    });
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
    const test = schema.getType(`TestabcMyTypeOrdering`)!.toConfig()

    expect(test.name).toEqual("TestabcMyTypeOrdering")
    const direction: GraphQLInputField = (test as any).fields.direction
    const sort: GraphQLInputField = (test as any).fields.sort

    expect(direction.type.toString()).toEqual("OrderingDirection")
    expect(direction.defaultValue.toString()).toEqual("ASC")

    expect(sort.type.toString()).toEqual("TestEnum!")
  })
})