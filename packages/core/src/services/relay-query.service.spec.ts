import { AutoRelayConfig } from '../services/auto-relay-config.service';
import { DynamicObjectFactory } from '../graphql/dynamic-object.factory';
import { Container } from 'typedi';
import 'jest-extended'
import { RelayedQueryService } from './relay-query.service';
jest.mock("../graphql/dynamic-object.factory");

const TestClass = class TestClass {
  public test(...args: any[]) {

  }
}
Reflect.defineMetadata('design:paramtypes', [], TestClass.prototype, 'test');

const TestThroughClass = class TestThroughClass {
  public test(...args: any[]) {

  }
}
Reflect.defineMetadata('design:paramtypes', [], TestThroughClass.prototype, 'test');


/**
 * Set of shared tests we want to execute on both Query and FieldResolvers
 * @param methodToCall if we want to run theses tests on query or fieldResolvers
 */
const sharedTests = (methodToCall: keyof RelayedQueryService) => {
  let service!: RelayedQueryService

  beforeEach(() => {
    service = new RelayedQueryService()
  })

  describe('GQL / SDL', () => {
    describe('Connection/Edge', () => {
      let makeEdgeConnection: jest.Mock<DynamicObjectFactory['getEdgeConnection']> = jest.fn();

      beforeEach(() => {
        makeEdgeConnection = jest.fn(() => () => ({ Connection: Object as any, Edge: Object as any }));
        DynamicObjectFactory.prototype.getEdgeConnection = makeEdgeConnection as any;
        Container.set(DynamicObjectFactory, new DynamicObjectFactory());
      })

      it('Should save args propertyName  in metadata if not inline', (cb) => {
        service[methodToCall](TestClass.prototype, 'test', {} as any, () => Object, undefined, { paginationInputType: "anotherTest" })
        process.nextTick(() => {
          const test = Reflect.getMetadata('autorelay:connectionArgs:key', TestClass.prototype, 'test')
          expect(test).toBeTruthy();
          expect(test).toEqual("anotherTest")
          cb()
        });
      })

      it('Should create Connection with To', (cb) => {
        const To = () => TestClass
        service[methodToCall](TestClass.prototype, 'test', {} as any, To)

        process.nextTick(() => {
          expect(makeEdgeConnection.mock.calls).toContainAllValues([
            [To, undefined]
          ]);
          cb();
        })
      })

      it('Should create with Through', (cb) => {
        const Through = () => Object;
        const To = () => Object;

        service[methodToCall](TestClass.prototype, 'test', {} as any, To, Through)

        process.nextTick(() => {
          expect(makeEdgeConnection.mock.calls).toContainAllValues([
            [To, Through]
          ]);
          cb()
        })

      })

    })
  })
}

describe('RelayedQueryService', () => {
  let ORMCo: unknown;
  let autoRelayFactory = jest.fn(() => function zeGetterTest() { })

  beforeEach(() => {
    autoRelayFactory = jest.fn(() => function zeGetterTest() { })
    class ORMCo {
      constructor() {
        return { autoRelayFactory: autoRelayFactory }
      }
    }

    new AutoRelayConfig({ orm: () => ORMCo as any });

  })


  describe('RelayedQuery', () => {
    sharedTests("makeMethodRelayedQuery")
  })

  describe('RelayedFieldResolver', () => {
    sharedTests("makeMethodRelayedFieldResolver")
  })

})
