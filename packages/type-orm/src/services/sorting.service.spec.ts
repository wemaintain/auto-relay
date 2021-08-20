import { SortingService } from './sorting.service';
import { getSortablesFromResolverData } from "@auto-relay/sorting"
import { TypeOrmConnection } from '../type-orm-connection'
import { OrderingDirection, NullsOrdering } from '@auto-relay/sorting/graphql/ordering.input'
import { Container } from 'typedi'

jest.mock("../type-orm-connection")
jest.mock("@auto-relay/sorting")
describe("TypeORM Sorting Service", () => {
  let getSortables: jest.Mock<ReturnType<typeof getSortablesFromResolverData>>
  let service: SortingService
  let typeormConnection: jest.Mocked<TypeOrmConnection>
  const entity = class {}

  beforeEach(() => {
    jest.resetAllMocks()
    typeormConnection = new TypeOrmConnection() as any
    Container.set(TypeOrmConnection, typeormConnection)
    getSortables = getSortablesFromResolverData as any
    service = new SortingService()
  })

  it("Should return empty on no field used", () => {
    getSortables.mockReturnValueOnce([])
    const test = service.buildOrderObject({} as any, {} as any, 'test')

    expect(test).toStrictEqual({})
  })

  it("Should prepend prefix", () => {
    getSortables.mockReturnValueOnce([
      { name: "foo", schemaName: "foo", type: entity, direction: OrderingDirection.ASC }
    ])
    typeormConnection.getColumnsOfFields.mockReturnValue({ foo: "foo" })
    const test = service.buildOrderObject({} as any, {} as any, "test", 'test.')
    expect(test).toStrictEqual({ "test.foo": "ASC" })
  })

  it("Should return db name", () => {
    getSortables.mockReturnValueOnce([
      { name: "foo", schemaName: "foo", type: entity, direction: OrderingDirection.ASC }
    ])
    typeormConnection.getColumnsOfFields.mockReturnValue({ foo: "dbFoo" })
    const test = service.buildOrderObject({} as any, {} as any, "test", '')
    expect(test).toStrictEqual({ "dbFoo": "ASC" })
  })

  
  it("Should support nulls ordering", () => {
    getSortables.mockReturnValueOnce([
      { name: "foo", schemaName: "foo", type: entity, direction: OrderingDirection.ASC, nulls: NullsOrdering.FIRST },
      { name: "bar", schemaName: "bar", type: entity, direction: OrderingDirection.DESC, nulls: NullsOrdering.LAST },
    ])
    typeormConnection.getColumnsOfFields.mockReturnValue({ 
      foo: "dbFoo",
      bar: "dbBar",
    })

    const test = service.buildOrderObject({} as any, {} as any, "test", '')
    expect(test).toStrictEqual({ 
      "dbFoo": { order: "ASC", nulls: "NULLS FIRST" },
      "dbBar": { order: "DESC", nulls: "NULLS LAST" },
    })
  })

  describe('buildOrderByConditionValue', () => {
    it("Should returns ASC", () => {
      const result = service["buildOrderByConditionValue"]({direction: "ASC"})
      expect(result).toEqual("ASC")
    })

    it("Should returns DESC", () => {
      const result = service["buildOrderByConditionValue"]({direction: "DESC"})
      expect(result).toEqual("DESC")
    })

    it("Should not care about undefined nulls values", () => {
      const withUndefined = service["buildOrderByConditionValue"]({direction: "ASC", nulls: undefined})

      expect(withUndefined).toEqual("ASC")
    })

    it("Should returns a NULLS FIRST", () => {
      const result = service["buildOrderByConditionValue"]({direction: "ASC", nulls: "FIRST"})
      expect(result).toEqual({order: "ASC", nulls: "NULLS FIRST"})
    })

    it("Should returns a NULLS LAST", () => {
      const result = service["buildOrderByConditionValue"]({direction: "DESC", nulls: "LAST"})
      expect(result).toEqual({order: "DESC", nulls: "NULLS LAST"})
    })
  })

})