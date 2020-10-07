import { PREFIX } from './../services/auto-relay-config.service';
import { RelayedConnectionOptions } from './../decorators/relayed-connection.decorator';
import { DynamicObjectFactory } from "./dynamic-object.factory";
import { Container } from "typedi";
import { AutoRelayConfig, PAGINATION_OBJECT } from "../services/auto-relay-config.service";
import { ORMConnection } from "../orm/orm-connection.abstract";
import * as TGQL from 'type-graphql'
import { ClassValueThunk } from '..';
jest.mock('type-graphql', () => ({
  __esModule: true,
  ...jest.requireActual('type-graphql')
}));


class ORMMock extends ORMConnection {
  public getColumnsOfFields(entity: ClassValueThunk<any>, keys: string[]): Record<string, string | undefined> {
    throw new Error("Method not implemented.");
  }
  public autoRelayFactory(field: any, self: any, type: any, through?: any) {
    return (): any => { };
  }
}


describe('DynamicObject factory', () => {
  let dynamicObjectFactory = new DynamicObjectFactory();

  beforeEach(() => {
    dynamicObjectFactory = new DynamicObjectFactory();
  })

  describe('makeEdgeConnection', () => {
    it('Should auto create one if PAGINATION_OBJECT wasn\'t init\'d', () => {
      expect(dynamicObjectFactory.getEdgeConnection(() => Object)).toBeTruthy()
      expect(Container.get<Function>(PAGINATION_OBJECT)()).toBeTruthy()
    })

    it('Should throw if PAGINATION_OBJECT isn\'t a function', () => {
      Container.set(PAGINATION_OBJECT, {} as any)
      expect(() => dynamicObjectFactory.getEdgeConnection(() => Object)).toThrowError(/PageInfo/)
    })

    it('Should throw if PAGINATION_OBJECT returns undefined', () => {
      Container.set(PAGINATION_OBJECT, () => undefined as any)
      expect(() => dynamicObjectFactory.getEdgeConnection(() => Object)).toThrowError(/PageInfo/)
    })

    it('Should return a decorated Edge Object', () => {
      new AutoRelayConfig({ orm: () => ORMMock });

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

      const { Edge } = dynamicObjectFactory.getEdgeConnection(() => class Foo {})

      expect(Edge).toBeTruthy();
      expect(fieldInnerSpy.mock.calls).toIncludeAllMembers([
        [Edge.prototype, 'node'],
        [Edge.prototype, 'cursor']
      ])

      expect(objectSpy).toHaveBeenCalledWith('FooEdge');

      fieldSpy.mockRestore();
      objectSpy.mockRestore();
    })

    it('Should return a decorated Connection Object', () => {
      new AutoRelayConfig({ orm: () => ORMMock });

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

      const { Connection } = dynamicObjectFactory.getEdgeConnection(() => class Foo {})

      expect(Connection).toBeTruthy();

      expect(objectSpy).toHaveBeenCalledWith('FooConnection');

      fieldSpy.mockRestore();
      objectSpy.mockRestore();
    })

    it('Should pass nullable options to edge field on Connection Object', () => {
      new AutoRelayConfig({ orm: () => ORMMock });

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

      const options: RelayedConnectionOptions = {
        field: {
          nullable: 'items'
        }
      }

      const { Connection } = dynamicObjectFactory.getEdgeConnection(() => class Foo {}, undefined, options)

      expect(Connection).toBeTruthy();
      expect(objectSpy).toHaveBeenCalledWith('FooConnection');

      expect(fieldSpy.mock.calls[fieldSpy.mock.calls.length - 1][1]).toEqual({ nullable: 'items' })

      fieldSpy.mockRestore();
      objectSpy.mockRestore();
    })

    it('Should prefix connection/edge names with global prefix', () => {
      Container.set(PREFIX, "aTestPrefix")

      const objectSpy = jest.spyOn(TGQL, 'ObjectType');
      dynamicObjectFactory.getEdgeConnection(() => class Foo {})

      expect(objectSpy).toHaveBeenCalledWith('aTestPrefixFooConnection');
      expect(objectSpy).toHaveBeenCalledWith('aTestPrefixFooEdge');

      objectSpy.mockRestore();
    })
  })

  describe('declareFunctionAsRelayInSDL', () => {
    it('Should add typescript reflect data on the function', () => {
      new AutoRelayConfig({ orm: () => ORMMock });
      const { Connection } = dynamicObjectFactory.getEdgeConnection(() => class Foo {})

      const Test = class TestClass { };

      dynamicObjectFactory.declareFunctionAsRelayInSDL(Test, 'testFn', '', Connection);
      const meta = Reflect.getMetadata('design:paramtypes', Test, 'testFn');

      expect(meta).toIncludeAllMembers([String, Number, String, Number])
    })

    it('Should decorate the function for the SDL', () => {
      new AutoRelayConfig({ orm: () => ORMMock });
      const { Connection } = dynamicObjectFactory.getEdgeConnection(() => class Foo {})
      const fieldSpy = jest.spyOn(TGQL, 'Field');
      const argSpy = jest.spyOn(TGQL, 'Arg');

      const argInnerSpy = jest.fn();
      const fieldInnerSpy = jest.fn();
      fieldSpy.mockImplementation((_a, _b) => {
        return fieldInnerSpy;
      });
      argSpy.mockImplementation((_a, _b) => {
        return argInnerSpy;
      });

      const Test = class TestClass { };
      dynamicObjectFactory.declareFunctionAsRelayInSDL(Test, 'testFn', 'aField', Connection);

      expect(argSpy).toHaveBeenCalledTimes(4)
      expect(argSpy.mock.calls).toIncludeSameMembers([
        ['after', expect.anything(), { nullable: true }],
        ['first', expect.anything(), { nullable: true }],
        ['before', expect.anything(), { nullable: true }],
        ['last', expect.anything(), { nullable: true }]
      ])

      expect(fieldSpy).toHaveBeenCalledTimes(1)
      expect(fieldSpy).toHaveBeenCalledWith(expect.anything(), { name: 'aField' })

      fieldSpy.mockRestore();
      argSpy.mockRestore();
    })


    it('Should pass Field Options to the function', () => {
      new AutoRelayConfig({ orm: () => ORMMock });
      const { Connection } = dynamicObjectFactory.getEdgeConnection(() => class Foo {})
      const fieldSpy = jest.spyOn(TGQL, 'Field');

      const fieldInnerSpy = jest.fn();
      fieldSpy.mockImplementation((_a, _b) => {
        return fieldInnerSpy;
      });
      const Test = class TestClass { };

      const options: RelayedConnectionOptions = {
        field: {
          name: "test",
          description: "a test description",
          complexity: 1,
          deprecationReason: "a reason",
          nullable: "items",
        }
      }

      dynamicObjectFactory.declareFunctionAsRelayInSDL(Test, 'testFn', 'aField', Connection, options);

      expect(fieldSpy).toHaveBeenCalledTimes(1)
      expect(fieldSpy).toHaveBeenCalledWith(expect.anything(), { 
        name: 'aField',
        ...options.field,
        nullable: undefined
      })

      fieldSpy.mockRestore();
    })
  })


  describe('Edge/Connection cache', () => {
    const To = class To {}
    const Through = class Through {}

    it('Should re-use already created Connection and Edge', () => {
      const test1 = dynamicObjectFactory.getEdgeConnection(() => To)
      const test2 = dynamicObjectFactory.getEdgeConnection(() => To)

      expect(test1.Connection).toBe(test2.Connection)
      expect(test1.Edge).toBe(test2.Edge)
    })

    it('Should re-use already created Connection and Edge for matching Through', () => {
      const test1 = dynamicObjectFactory.getEdgeConnection(() => To)
      const test2 = dynamicObjectFactory.getEdgeConnection(() => To, () => Through)
      const test3 = dynamicObjectFactory.getEdgeConnection(() => To, () => Through)

      expect(test1.Connection).not.toBe(test2.Connection)
      expect(test1.Edge).not.toBe(test2.Edge)

      expect(test2.Connection).toBe(test3.Connection)
      expect(test2.Edge).toBe(test3.Edge)
    })
  })
})