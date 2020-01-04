import { Container } from 'typedi';
import { Sortable, AUTORELAY_SORTABLE_ARG_NAME, AUTORELAY_SORTABLE_ARG_OBJECT } from "./sortable.decorator"
import { GQLSortingGenerator } from "../graphql/graphql.generator"

jest.mock(`../graphql/graphql.generator`)
describe("@Sortable", () => {

  let sortingGenerator: jest.Mocked<GQLSortingGenerator>

  beforeEach(() => {
    jest.resetAllMocks()
    sortingGenerator =  new GQLSortingGenerator() as any
    Container.set(GQLSortingGenerator, sortingGenerator)
  })

  afterEach(() => {
  })

  it("Should reflect arg name", () => {
    const Test = class {}
    const Entity = class {}

    Sortable(() => Entity)(Test.prototype, "testQuery", {})
    const test = Reflect.getMetadata(AUTORELAY_SORTABLE_ARG_NAME, Test.prototype, "testQuery")

    expect(test).toEqual("order")
  })

  it("Should reflect type", (cb) => {
    const Test = class {}
    const Entity = class {}

    Sortable(() => Entity)(Test.prototype, "testQuery", {})
    process.nextTick(() => {
      const test = Reflect.getMetadata(AUTORELAY_SORTABLE_ARG_OBJECT, Test.prototype, "testQuery")
      expect(test).toEqual(Entity)
      cb()
    })
  })

  it("Should call graphql factory", (cb) => {
    const Test = class {}
    const Entity = class {}

    Sortable(() => Entity)(Test.prototype, "testQuery", {})

    process.nextTick(() => {
      expect(sortingGenerator.generateForType).toHaveBeenCalledTimes(1)
      expect(sortingGenerator.generateForType.mock.calls).toContainAllValues([
        [Entity, Test.prototype, "testQuery"]
      ])
      cb()
    })

  })
})