import { AutoRelayConfig } from '../services/auto-relay-config.service';
import { RelayedConnection } from './relayed-connection.decorator';
import { DynamicObjectFactory } from '../graphql/dynamic-object.factory';
import { Container } from 'typedi';
import { RelayedQuery } from './relayed-query.decorator';
import 'jest-extended'
jest.mock("../graphql/dynamic-object.factory");

const TestClass = class TestClassImpl {
  public test(...args: any[]) {

  }
}
Reflect.defineMetadata('design:paramtypes', [], TestClass.prototype, 'test');


describe('RelayedQuery', () => {
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




  describe('GQL / SDL', () => {
    describe('Connection/Edge', () => {
      let makeEdgeConnection: jest.Mock<DynamicObjectFactory['makeEdgeConnection']> = jest.fn();

      beforeEach(() => {
        makeEdgeConnection = jest.fn(() => () => ({ Connection: Object as any, Edge: Object as any }));
        DynamicObjectFactory.prototype.makeEdgeConnection = makeEdgeConnection as any;
        Container.set(DynamicObjectFactory, new DynamicObjectFactory());
      })

      it('Should create with name of method', (cb) => {
        RelayedQuery(() => Object)(TestClass.prototype, 'test', {} as any)

        process.nextTick(() => {
          expect(makeEdgeConnection.mock.calls).toContainAllValues([
            ['test', expect.toBeFunction(), undefined]
          ]);
          cb();
        })


      })

      it('Should create with supplied name', (cb) => {
        RelayedQuery(() => Object, { name: "anotherTest" })(TestClass.prototype, 'test', {} as any)

        process.nextTick(() => {
          expect(makeEdgeConnection.mock.calls).toContainAllValues([
            ['anotherTest', expect.toBeFunction(), undefined]
          ]);
          cb()
        });

      })

      it('Should save args propertyName  in metadata if not inline', (cb) => {
        RelayedQuery(() => Object, { paginationInputType: "anotherTest" })(TestClass.prototype, 'test', {} as any)
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

        RelayedQuery(Model, Through)(TestClass.prototype, 'test', {} as any)

        process.nextTick(() => {
          expect(makeEdgeConnection.mock.calls).toContainAllValues([
            ['test', Model, Through]
          ]);
          cb()
        })

      })

    })
  })


})