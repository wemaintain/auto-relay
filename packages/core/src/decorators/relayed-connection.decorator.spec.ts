import { AutoRelayConfig } from './../services/auto-relay-config.service';
import { RelayedConnection } from './relayed-connection.decorator';
import 'jest-extended'
import { DynamicObjectFactory } from '../graphql/dynamic-object.factory';
import Container from 'typedi';
import { NoORMError } from '..';


describe('RelayedConnection', () => {
  let ORMCo: unknown;
  let autoRelayFactory = jest.fn(() => function zeGetterTest() { })

  describe('Without Config', () => {
    it('Should create a getter on the class that always throws', (cb) => {
      class TestLinked { }
      const testClassType = class TestClass {
        testLinked: TestLinked | undefined
      }
      const toTest = () => TestLinked;
      RelayedConnection(toTest)(testClassType.prototype, 'testLinked')

      const getterName = `relayFieldtestLinkedGetter`;
      process.nextTick(() => {
        const getter = (testClassType as unknown as Record<string, any>).prototype[getterName];
        expect(getter).toBeTruthy()
        expect(typeof getter).toBe('function')
        expect(() => getter()).toThrowError(NoORMError)
        cb();
      })
    })
  })

  describe('With Config', () => {
    beforeEach(() => {
      autoRelayFactory = jest.fn(() => function zeGetterTest() { })
      class ORMCo {
        constructor() {
          return { autoRelayFactory: autoRelayFactory }
        }
      }
  
      new AutoRelayConfig({ orm: () => ORMCo as any })
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
            ['testLinked', expect.anything(), toTest, undefined, undefined],
            ['testLinkedThrough', expect.anything(), toTest, toTestLink, undefined]
          ])
  
          cb();
        })
      })
  
      it('Should pass correct options to the orm factory', (cb) => {
        class TestLinked { }
        class TestLinkedThrough { }
        const testClassType = class TestClass {
          testLinked: TestLinked | undefined
          testLinkedThrough: TestLinked | undefined
        }
  
        const toTest = () => TestLinked;
        const toTestLink = () => TestLinkedThrough;
        const options = {test:"test"} as any;
  
        RelayedConnection(toTest, options)(testClassType.prototype, 'testLinked')
        RelayedConnection(toTest, toTestLink, options)(testClassType.prototype, 'testLinkedThrough')
  
        process.nextTick(() => {
          expect(autoRelayFactory.mock.calls).toContainAllValues([
            ['testLinked', expect.anything(), toTest, undefined, options],
            ['testLinkedThrough', expect.anything(), toTest, toTestLink, options]
          ])
  
          cb();
        })
      })
  
      it('Should create a getter on the class', (cb) => {
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

  describe('GQL / SDL', () => {
    it.todo('Should call the GQL Object factories factory')
  })

})