import { RelayFromArrayCountFactory, extractGetterFunctionReturn } from "./relay-from-array-count.middleware"
import { AutoRelayRoot } from "../interfaces/auto-relay-root-metadata.interface"
import { Connection } from "graphql-relay"

describe('Relay from array count', () => {

  describe('Return formats', () => {

    it('Should accept [count, entities[]]', () => {
      const test1 = extractGetterFunctionReturn([2, [{foo: "foo"}, {foo: "foo"}], undefined])
      const test2 = extractGetterFunctionReturn<any, true>([2, [{foo: "foo"}, {foo: "foo"}], "foo"])

      expect(test1[0]).toEqual(2)
      expect(test2[0]).toEqual(2)
      expect(Array.isArray(test1[1])).toBeTrue()
      expect(Array.isArray(test2[1])).toBeTrue()
      expect(test1[2]).toBeUndefined()
      expect(test2[2]).toEqual("foo")
    })

    it('Should accept [entities[], count]', () => {
      const test1 = extractGetterFunctionReturn([[{foo: "foo"}, {foo: "foo"}], 2, undefined])
      const test2 = extractGetterFunctionReturn<any, true>([[{foo: "foo"}, {foo: "foo"}], 2, "foo"])

      expect(test1[0]).toEqual(2)
      expect(test2[0]).toEqual(2)
      expect(Array.isArray(test1[1])).toBeTrue()
      expect(Array.isArray(test2[1])).toBeTrue()
      expect(test1[2]).toBeUndefined()
      expect(test2[2]).toEqual("foo")
    })

    it('Should accept object', () => {
      const test1 = extractGetterFunctionReturn({
        count: 2,
        rows: [{foo: "foo"}, {foo: "foo"}],
        key: undefined,
      })
      const test2 = extractGetterFunctionReturn<any, true>(
        {
          count: 2,
          rows: [{foo: "foo"}, {foo: "foo"}],
          key: "foo",
        }
      )

      expect(test1[0]).toEqual(2)
      expect(test2[0]).toEqual(2)
      expect(Array.isArray(test1[1])).toBeTrue()
      expect(Array.isArray(test2[1])).toBeTrue()
      expect(test1[2]).toBeUndefined()
      expect(test2[2]).toEqual("foo")
    })

  })

  describe('Metadata', () => {
    it('Should attach totalItem metadata', async () => {
      const test = await RelayFromArrayCountFactory({}, '')({} as any, function() { return [3, [{}, {}, {}]] } as any)
      const root = test as Connection<any> & AutoRelayRoot
      const rootPagination = test.pageInfo as Connection<any>['pageInfo'] & AutoRelayRoot

      expect(root._autoRelayMetadata).toBeDefined()
      expect(root._autoRelayMetadata.totalItems).toEqual(3)

      expect(rootPagination._autoRelayMetadata).toBeDefined()
      expect(rootPagination._autoRelayMetadata.totalItems).toEqual(3)
    })
  })
})