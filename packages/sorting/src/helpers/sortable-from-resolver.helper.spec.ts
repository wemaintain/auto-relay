import { SortingFieldDoesntExistError } from './../errors/sorting-field-no-exists.error';
import { ClassType } from 'type-graphql'
import { NotSortableError } from './../errors/not-sortable.error'
import { getSortablesFromResolverData, SortingField } from "./sortable-from-resolver.helper"
import { AUTORELAY_ENUM_REVERSE_MAP } from '../graphql/graphql.generator'
import { OrderingValue } from '../graphql/ordering.input'

describe("SortableFromResolver", () => {

  let resolver: ClassType
  let entity: ClassType

  beforeEach(() => {
    resolver = class { }
    entity = class { }
    Reflect.defineMetadata(AUTORELAY_ENUM_REVERSE_MAP, [{ name: "foo", schemaName: "foo", type: entity }, { name: "bar", schemaName: "schemaBar", type: entity }], resolver, 'test')
  })

  it("Should throw on non decorated query", () => {
    expect(
      () => getSortablesFromResolverData({} as any, class Test { }, "testA")
    ).toThrowWithMessage(NotSortableError, new RegExp(/Test\.testA/))
  })

  it("Should return empty array on no ordering", () => {
    const testEmptyArray = getSortablesFromResolverData({ args: { order: [] } } as any, resolver, "test")
    const testNoArray = getSortablesFromResolverData({ args: {} } as any, resolver, "test")

    expect(testEmptyArray.length).toEqual(0)
    expect(testNoArray.length).toEqual(0)
  })

  it("Should throw when using something out of enum", () => {
    expect(
      () => getSortablesFromResolverData({
        args: {
          order: [
            { sort: "DoesntExist" }
          ] as OrderingValue[]
        }
      } as any, resolver, "test")
    ).toThrow(SortingFieldDoesntExistError)
  })

  it("Should return array of SortingField (without nulls)", () => {
    const test = getSortablesFromResolverData({
      args: {
        order: [
          { sort: "foo", direction: "DESC" },
          { sort: "schemaBar" },
        ] as OrderingValue[]
      }
    } as any, resolver, "test")

    expect(test).toHaveLength(2)
    expect(test).toContainAllValues([
      { direction: "DESC", name: "foo", schemaName: "foo", type: entity, nulls: undefined },
      { direction: "ASC", name: "bar", schemaName: "schemaBar", type: entity, nulls: undefined },
    ] as SortingField[])
  })

  it("Should return array of SortingField (with nulls)", () => {
    const test = getSortablesFromResolverData({
      args: {
        order: [
          { sort: "foo", direction: "DESC", nulls: "LAST" },
          { sort: "schemaBar", nulls: "FIRST" },
        ] as OrderingValue[]
      }
    } as any, resolver, "test")

    expect(test).toHaveLength(2)
    expect(test).toContainAllValues([
      { direction: "DESC", name: "foo", schemaName: "foo", type: entity, nulls: "LAST" },
      { direction: "ASC", name: "bar", schemaName: "schemaBar", type: entity, nulls: "FIRST" },
    ] as SortingField[])
  })

})