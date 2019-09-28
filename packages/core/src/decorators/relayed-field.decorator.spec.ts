import { DynamicObjectFactory } from './../graphql/dynamic-object.factory';
import { RelayedField } from "./relayed-field.decorator";
import { Field } from "type-graphql"
import Container from 'typedi';
jest.mock('type-graphql')
jest.mock('../graphql/dynamic-object.factory')

const TestClass = class TestClass {
  public test: any;
}

describe('RelayedField', () => {
  const To = () => class To { }
  const Through = () => class Through { }

  const fieldMock: jest.Mock<typeof Field, []> = Field as any
  const innerFieldMock: jest.Mock<ReturnType<typeof Field>, []> = jest.fn()
  const dynamicObjectFactoryMock: jest.Mocked<DynamicObjectFactory> = new DynamicObjectFactory() as any
  const mockConnection: any = { _test: "test" };
  const mockOptions: any = { anOption: "test" };

  beforeEach(() => {
    dynamicObjectFactoryMock.getEdgeConnection.mockReset()
    dynamicObjectFactoryMock.getEdgeConnection.mockReturnValue({ Connection: mockConnection, Edge: { _test: "test" } as any })
    fieldMock.mockReset()
    innerFieldMock.mockReset()
    fieldMock.mockReturnValue(innerFieldMock)
    Container.set(DynamicObjectFactory, dynamicObjectFactoryMock)
  })

  describe('Field alias', () => {
    it('Should call Field with To', (cb) => {
      RelayedField(To)(TestClass.prototype, 'test')

      process.nextTick(() => {
        expect(fieldMock).toHaveBeenCalledTimes(1)

        expect(dynamicObjectFactoryMock.getEdgeConnection).toHaveBeenCalledTimes(1)
        expect(dynamicObjectFactoryMock.getEdgeConnection.mock.calls).toContainAllValues([
          [ To, undefined, { field: undefined } ]
        ])

        expect((fieldMock.mock.calls as any[])[0][0]()).toBe(mockConnection)
        expect((fieldMock.mock.calls as any[])[0][1]).toBe(undefined)

        expect(innerFieldMock).toHaveBeenCalledTimes(1)
        expect(innerFieldMock.mock.calls).toContainAllValues([
          [TestClass.prototype, 'test']
        ])

        cb()
      })
    })

    it('Should call Field with To and Options', (cb) => {
      RelayedField(To, mockOptions)(TestClass.prototype, 'test')

      process.nextTick(() => {
        expect(fieldMock).toHaveBeenCalledTimes(1)

        expect(dynamicObjectFactoryMock.getEdgeConnection).toHaveBeenCalledTimes(1)
        expect(dynamicObjectFactoryMock.getEdgeConnection.mock.calls).toContainAllValues([
          [ To, undefined, { field: mockOptions } ]
        ])

        expect((fieldMock.mock.calls as any[])[0][0]()).toBe(mockConnection)
        expect((fieldMock.mock.calls as any[])[0][1]).toBe(mockOptions)

        expect(innerFieldMock).toHaveBeenCalledTimes(1)
        expect(innerFieldMock.mock.calls).toContainAllValues([
          [TestClass.prototype, 'test']
        ])

        cb()
      })
    })

    it('Should call Field with To and Through', (cb) => {
      RelayedField(To, Through)(TestClass.prototype, 'test')

      process.nextTick(() => {
        expect(fieldMock).toHaveBeenCalledTimes(1)

        expect(dynamicObjectFactoryMock.getEdgeConnection).toHaveBeenCalledTimes(1)
        expect(dynamicObjectFactoryMock.getEdgeConnection.mock.calls).toContainAllValues([
          [ To, Through, { field: undefined } ]
        ])

        expect((fieldMock.mock.calls as any[])[0][0]()).toBe(mockConnection)
        expect((fieldMock.mock.calls as any[])[0][1]).toBe(undefined)

        expect(innerFieldMock).toHaveBeenCalledTimes(1)
        expect(innerFieldMock.mock.calls).toContainAllValues([
          [TestClass.prototype, 'test']
        ])

        cb()
      })
    })

    it('Should call Field with To And Through and Options', (cb) => {
      RelayedField(To, Through, mockOptions)(TestClass.prototype, 'test')

      process.nextTick(() => {
        expect(fieldMock).toHaveBeenCalledTimes(1)

        expect(dynamicObjectFactoryMock.getEdgeConnection).toHaveBeenCalledTimes(1)
        expect(dynamicObjectFactoryMock.getEdgeConnection.mock.calls).toContainAllValues([
          [ To, Through, { field: mockOptions } ]
        ])

        expect((fieldMock.mock.calls as any[])[0][0]()).toBe(mockConnection)
        expect((fieldMock.mock.calls as any[])[0][1]).toBe(mockOptions)

        expect(innerFieldMock).toHaveBeenCalledTimes(1)
        expect(innerFieldMock.mock.calls).toContainAllValues([
          [TestClass.prototype, 'test']
        ])

        cb()
      })
    })
  })
})