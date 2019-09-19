import { AutoRelayConfig } from '../services/auto-relay-config.service';
import { DynamicObjectFactory } from '../graphql/dynamic-object.factory';
import { Container } from 'typedi';
import 'jest-extended'
import { RelayedQueryService } from './relay-query.service';
jest.mock("../graphql/dynamic-object.factory");

const TestClass = class TestClassImpl {
  public test(...args: any[]) {

  }
}
Reflect.defineMetadata('design:paramtypes', [], TestClass.prototype, 'test');


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
      let makeEdgeConnection: jest.Mock<DynamicObjectFactory['makeEdgeConnection']> = jest.fn();

      beforeEach(() => {
        makeEdgeConnection = jest.fn(() => () => ({ Connection: Object as any, Edge: Object as any }));
        DynamicObjectFactory.prototype.makeEdgeConnection = makeEdgeConnection as any;
        Container.set(DynamicObjectFactory, new DynamicObjectFactory());
      })

      it('Should create with name of method', (cb) => {
        service[methodToCall](TestClass.prototype, 'test', {} as any, () => Object)

        process.nextTick(() => {
          expect(makeEdgeConnection.mock.calls).toContainAllValues([
            ['test', expect.toBeFunction(), undefined]
          ]);
          cb();
        })


      })

      it('Should create with supplied name', (cb) => {
        service[methodToCall](TestClass.prototype, 'test', {} as any, () => Object, undefined, { name: "anotherTest" })

        process.nextTick(() => {
          expect(makeEdgeConnection.mock.calls).toContainAllValues([
            ['anotherTest', expect.toBeFunction(), undefined]
          ]);
          cb()
        });

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

      it('Should create with Through', (cb) => {
        const Through = () => Object;
        const Model = () => Object;

        service[methodToCall](TestClass.prototype, 'test', {} as any, Model, Through)

        process.nextTick(() => {
          expect(makeEdgeConnection.mock.calls).toContainAllValues([
            ['test', Model, Through]
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
