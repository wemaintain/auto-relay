import { biDirectionalPageInfo } from './bi-directional-pageinfo.function'

describe('biDirectional PageInfo helper', () => {

  it('Should set hasPreviousPage to true when we have previous elements', () => {
    const test = biDirectionalPageInfo(
      { edges: [], pageInfo: { hasPreviousPage: false, hasNextPage: true, startCursor: '', endCursor: '' } },
      { arrayLength: 100, sliceStart: 10 },
      10
    )

    expect(test.pageInfo.hasPreviousPage).toBeTrue()
  })

  it('Should set hasNextPage to true when we have next elements', () => {
    const test = biDirectionalPageInfo(
      { edges: [], pageInfo: { hasPreviousPage: false, hasNextPage: false, startCursor: '', endCursor: '' } },
      { arrayLength: 100, sliceStart: 10 },
      10
    )

    expect(test.pageInfo.hasNextPage).toBeTrue()
  })

})