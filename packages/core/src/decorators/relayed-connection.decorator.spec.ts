import { AutoRelayConfig } from './../services/auto-relay-config.service';
import { RelayedConnection } from './relayed-connection.decorator';
import 'jest-extended'
import { DynamicObjectFactory } from '../graphql/dynamic-object.factory';
import Container from 'typedi';


describe('RelayedConnection', () => {
  let ORMCo: unknown;
  let autoRelayFactory = jest.fn(() => function zeGetterTest() { })

  beforeEach(() => {
    autoRelayFactory = jest.fn(() => function zeGetterTest() { })
    class ORMCo {
      constructor() {
        return { autoRelayFactory: autoRelayFactory }
      }
    }

    new AutoRelayConfig({ orm: () => ORMCo as any })
  })


  describe('GQL / SDL', () => {
    it.todo('Should call the GQL Object factories factory')
  })

  describe('ORM', () => {
    it('Should call the orm factory', (cb) => {
      class TestLinked { }
      class TestLinkedThrough { }
      const testClassType = class TestClass {
        testLinked: TestLinked | undefined
        testLinkedThrough: TestLinked | undefined
      }

      const toTest = () => TestLinked;
      const toTestLink = () => TestLinkedThrough;

      RelayedConnection(toTest)(testClassType.prototype, 'testLinked')
      RelayedConnection(toTest, toTestLink)(testClassType.prototype, 'testLinkedThrough')

      process.nextTick(() => {
        expect(autoRelayFactory.mock.calls).toContainAllValues([
          ['testLinked', expect.anything(), toTest, undefined],
          ['testLinkedThrough', expect.anything(), toTest, toTestLink]
        ])

        cb();
      })
    })

    it('StestClassTypehould create a getter on the class', (cb) => {
      class TestLinked { }
      class TestLinkedThrough { }
      const testClassType = class TestClass {
        testLinked: TestLinked | undefined
      }
      const toTest = () => TestLinked;
      RelayedConnection(toTest)(testClassType.prototype, 'testLinked')

      const getterName = `relayFieldtestLinkedGetter`;
      process.nextTick(() => {

        expect((testClassType as unknown as Record<string, any>).prototype[getterName]).toBeTruthy()
        expect(typeof (testClassType as unknown as Record<string, any>).prototype[getterName]).toBe('function')

        cb();
      })
    })
  })
})