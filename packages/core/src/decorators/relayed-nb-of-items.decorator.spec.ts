import { RelayPaginationInner } from "./relayed-nb-of-items.decorator"
import { AutoRelayRoot } from "../interfaces/auto-relay-root-metadata.interface"

describe('Relayed nbOfItems decorator', () => {

  describe('RelayedPaginationInner', () => {
    it('Should return empty when no root', () => {
      const test = RelayPaginationInner({} as any)

      expect(test).toBeUndefined()
    })

    it('Should return totalItems metadata when present', () => {
      const test = RelayPaginationInner({ root: { _autoRelayMetadata: { totalItems: 3 } } as AutoRelayRoot } as any)

      expect(test).toEqual(3)
    })
  })
  
})