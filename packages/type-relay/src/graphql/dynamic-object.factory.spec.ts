import { DynamicObjectFactory } from "./dynamic-object.factory";
import { Container } from "typedi";
import { TypeRelayConfig } from "../services/type-relay-config.service";
import * as TGQL from 'type-graphql'

describe('DynamicObject factory', () => {
  let dynamicObjectFactory = new DynamicObjectFactory();

  beforeEach(() => {
    dynamicObjectFactory = new DynamicObjectFactory();
  })

  describe('makeEdgeConnection', () => {
    it('Should throw if PAGINATION_OBJECT wasn\'t init\'d', () => {
      expect(() => dynamicObjectFactory.makeEdgeConnection("", () => Object)).toThrowError(/PageInfo/)
    })

    it('Should throw if PAGINATION_OBJECT isn\'t a function', () => {
      Container.set('PAGINATION_OBJECT', {})
      expect(() => dynamicObjectFactory.makeEdgeConnection("", () => Object)).toThrowError(/PageInfo/)
    })

    it('Should throw if PAGINATION_OBJECT returns undefined', () => {
      Container.set('PAGINATION_OBJECT', () => undefined)
      expect(() => dynamicObjectFactory.makeEdgeConnection("", () => Object)).toThrowError(/PageInfo/)
    })

    it('Should return a decorated Edge Object', () => {
      new TypeRelayConfig({ orm: 'type-orm' });
      
      const fieldSpy = jest.spyOn(TGQL, 'Field');
      const objectSpy = jest.spyOn(TGQL, 'ObjectType');

      const objectInnerSpy = jest.fn();
      const fieldInnerSpy = jest.fn();
      fieldSpy.mockImplementation((_a, _b) => {
        return fieldInnerSpy;
      });
      objectSpy.mockImplementation((_a, _b) => {
        return objectInnerSpy;
      });

      const { Edge } = dynamicObjectFactory.makeEdgeConnection("Foo", () => Object)

      expect(Edge).toBeTruthy();
      expect(fieldInnerSpy.mock.calls).toIncludeAllMembers([
        [ Edge.prototype, 'node' ],
        [ Edge.prototype, 'cursor' ]
      ])

      expect(objectSpy).toHaveBeenCalledWith('FooEdge');

      fieldSpy.mockRestore();
      objectSpy.mockRestore();
    })

    it('Should return a decorated Connection Object', () => {
      new TypeRelayConfig({ orm: 'type-orm' });
      
      const fieldSpy = jest.spyOn(TGQL, 'Field');
      const objectSpy = jest.spyOn(TGQL, 'ObjectType');

      const objectInnerSpy = jest.fn();
      const fieldInnerSpy = jest.fn();
      fieldSpy.mockImplementation((_a, _b) => {
        return fieldInnerSpy;
      });
      objectSpy.mockImplementation((_a, _b) => {
        return objectInnerSpy;
      });

      const { Connection } = dynamicObjectFactory.makeEdgeConnection("Foo", () => Object)

      expect(Connection).toBeTruthy();

      expect(objectSpy).toHaveBeenCalledWith('FooConnection');

      fieldSpy.mockRestore();
      objectSpy.mockRestore();
    })

  })
})