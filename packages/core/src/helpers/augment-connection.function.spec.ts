import { augmentedConnection } from "./augment-connection.function";
import * as Relay from 'graphql-relay'

interface TestObject extends TestObjectAugment { testNode: TestEntity }
interface TestObjectAugment { augment: string, augmentObject: { test: number } }
interface TestEntity { n: number }
const testArray = (n = 10) => {
  const arr: Array<TestObject> = [];
  for (let i = 0; i < n; i++) {
    arr.push({ testNode: { n: i }, augment: `Augment${i}`, augmentObject: { test: i } })
  }
  return arr;
}

describe('AugmentConnection', () => {
  describe('Immutability', () => {
    it('Should preserve original connection pageInfo', () => {
      const c = Relay.connectionFromArray(testArray(), { first: 2 });
      const augmented = augmentedConnection(c, 'testNode');

      augmented.pageInfo.endCursor = "abcc";
      augmented.pageInfo.hasNextPage = false;
      augmented.pageInfo.hasPreviousPage = true;
      augmented.pageInfo.startCursor = "abcc";


      expect(augmented.pageInfo.endCursor).not.toBe(c.pageInfo.endCursor)
      expect(augmented.pageInfo.hasNextPage).not.toBe(c.pageInfo.hasNextPage)
      expect(augmented.pageInfo.hasPreviousPage).not.toBe(c.pageInfo.hasPreviousPage)
      expect(augmented.pageInfo.startCursor).not.toBe(c.pageInfo.startCursor)
    })

    it('Should preserve original edges', () => {
      const c = Relay.connectionFromArray(testArray(), { first: 2 });
      const augmented = augmentedConnection<{ testNode: { n: number } }>(c, 'testNode');

      c.edges[0].cursor = "abc";

      expect(augmented.edges[0].cursor).not.toBe(c.edges[0].cursor)
    })
  })

  describe('Augmented edges', () => {
    it('Should augment the edges with the original node', () => {
      const c = Relay.connectionFromArray(testArray(), { first: 2 });
      const augmented = augmentedConnection<TestEntity, TestObjectAugment>(c, 'testNode');

      expect(augmented.edges[0].augment).toBe(c.edges[0].node.augment);
      expect(augmented.edges[0].augmentObject.test).toBe(c.edges[0].node.augmentObject.test);
    })

    it('Should swap the nodes to the desired entity', () => {
      const throughKey = 'testNode';
      const c = Relay.connectionFromArray(testArray(), { first: 2 });
      const augmented = augmentedConnection<TestEntity, TestObjectAugment>(c, throughKey);

      expect(augmented.edges[0].node.n).toBe(c.edges[0].node[throughKey].n);
    })
  })
})