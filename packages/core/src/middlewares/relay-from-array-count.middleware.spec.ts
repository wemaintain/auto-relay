import { RelayFromArrayCountFactory } from "./relay-from-array-count.middleware"
import { AutoRelayRoot } from "../interfaces/auto-relay-root-metadata.interface"
import { Connection } from "graphql-relay"

describe('Relay from array count', () => {
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