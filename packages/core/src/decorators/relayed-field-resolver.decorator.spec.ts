import { AutoRelayConfig } from '../services/auto-relay-config.service'
import { RelayedQueryService } from '../services/relay-query.service'
import { Container } from 'typedi'
import { RelayedFieldResolver } from './relayed-field-resolver.decorator'
import 'jest-extended'
jest.mock('../services/relay-query.service')

const TestClass = class TestClassImpl {
  public test(...args: any[]) {

  }
}
Reflect.defineMetadata('design:paramtypes', [], TestClass.prototype, 'test')



describe('@RelayedFieldResolver', () => {
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



  describe('Call RelayedQueryService to generate SDL & middleware', () => {
    it('With Through and options', (cb) => {
      const Model = () => Object
      const Through = () => Object
      const options = { name: "TestTest" }
  
      const mock = new RelayedQueryService()
      Container.set(RelayedQueryService, mock)
  
      RelayedFieldResolver(Model, Through, options)(TestClass.prototype, 'test', {} as any)
      process.nextTick(() => {
        const makeMethodRelayed = mock.makeMethodRelayedFieldResolver as jest.Mock<RelayedQueryService['makeMethodRelayedFieldResolver']>
        expect(makeMethodRelayed).toHaveBeenCalledTimes(1)
        expect(makeMethodRelayed.mock.calls).toContainAllValues([
          [
            TestClass.prototype,
            'test',
            {},
            Model,
            Through,
            options
          ]
        ])
        cb()
      });
    })
  
    it('With options only', (cb) => {
      const Model = () => Object
      const options = { name: "TestTest" }
  
      const mock = new RelayedQueryService()
      Container.set(RelayedQueryService, mock)
  
      RelayedFieldResolver(Model, options)(TestClass.prototype, 'test', {} as any)
      process.nextTick(() => {
        const makeMethodRelayed = mock.makeMethodRelayedFieldResolver as jest.Mock<RelayedQueryService['makeMethodRelayedFieldResolver']>
        expect(makeMethodRelayed).toHaveBeenCalledTimes(1)
        expect(makeMethodRelayed.mock.calls).toContainAllValues([
          [
            TestClass.prototype,
            'test',
            {},
            Model,
            undefined,
            options
          ]
        ])
        cb()
      });
    })
  })


})