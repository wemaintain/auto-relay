import { SharedObjectFactory } from "../../src/graphql/shared-object.factory";
import * as TGQL from 'type-graphql'
import * as Relay from 'graphql-relay'
import { ObjectType, Field } from "type-graphql";
jest.mock('type-graphql', () => ({
  __esModule: true,
  ...jest.requireActual('type-graphql')
}));


describe('SharedObjectFactory', () => {
  let sharedObjectFactory = new SharedObjectFactory();
  beforeEach(() => {
    sharedObjectFactory = new SharedObjectFactory();
  })

  describe('PageInfo Factory', () => {
    it('Should create a PageInfo object', () => {
      const Test = sharedObjectFactory.generatePageInfo("");
      const testInstance = new Test();

      expect(test).toBeTruthy();
      expect(testInstance).toBeTruthy();
    })

    it('Should decorate the PageInfo fields correctly', () => {
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

      const Test = sharedObjectFactory.generatePageInfo("");

      expect(fieldSpy.mock.calls.length).toBe(4);

      expect(fieldInnerSpy).toHaveBeenCalledTimes(4)
      expect(fieldInnerSpy.mock.calls).toIncludeAllMembers([
        [Test.prototype, 'hasNextPage'],
        [Test.prototype, 'hasPreviousPage'],
        [Test.prototype, 'startCursor'],
        [Test.prototype, 'endCursor'],
      ]);

      expect(objectSpy.mock.calls.length).toBe(1);
      expect(objectSpy).toHaveBeenCalledWith('PageInfo')
      expect(objectInnerSpy).toHaveBeenCalledWith(Test);

      objectSpy.mockRestore();
      fieldSpy.mockRestore();
    })

    it('Should prefix the PageInfo object correctly', () => {
      const objectSpy = jest.spyOn(TGQL, 'ObjectType');

      const Test = sharedObjectFactory.generatePageInfo("");
      const Test2 = sharedObjectFactory.generatePageInfo("AB");
      const Test3 = sharedObjectFactory.generatePageInfo("ABCD");

      expect(objectSpy).toHaveBeenCalledTimes(3);
      expect(objectSpy.mock.calls).toEqual([
        ["PageInfo"], ["ABPageInfo"], ["ABCDPageInfo"]
      ]);

      objectSpy.mockRestore();
    });

    it('Should allow extending another object', () => {
      @ObjectType({ isAbstract: true })
      class AugmentPageInfo {
        @Field()
        public test: string = "test"
      }

      const Test = sharedObjectFactory.generatePageInfo('', () => AugmentPageInfo)
      const test = new Test()

      expect(test.test)
    })
  })


  describe('ConnectionArgs Factory', () => {
    it('Should create a ConnectionArgs object', () => {
      const Test = sharedObjectFactory.generateConnectionArgs("");
      const testInstance = new Test();

      expect(test).toBeTruthy();
      expect(testInstance).toBeTruthy();
    })

    it('Should decorate the ConnectionArgs fields correctly', () => {
      const fieldSpy = jest.spyOn(TGQL, 'Field');
      const objectSpy = jest.spyOn(TGQL, 'ArgsType');

      const objectInnerSpy = jest.fn();
      const fieldInnerSpy = jest.fn();
      fieldSpy.mockImplementation((_a, _b) => {
        return fieldInnerSpy;
      });
      objectSpy.mockImplementation(() => {
        return objectInnerSpy;
      });

      const Test = sharedObjectFactory.generateConnectionArgs("");

      expect(fieldSpy.mock.calls.length).toBe(4);

      expect(fieldInnerSpy).toHaveBeenCalledTimes(4)
      expect(fieldInnerSpy.mock.calls).toIncludeAllMembers([
        [Test.prototype, 'before'],
        [Test.prototype, 'after'],
        [Test.prototype, 'first'],
        [Test.prototype, 'last'],
      ]);

      expect(objectSpy.mock.calls.length).toBe(1);
      expect(objectInnerSpy).toHaveBeenCalledWith(Test);

      objectSpy.mockRestore();
      fieldSpy.mockRestore();
    })

    it('Should prefix the ConnectionArgs object correctly', () => {
      const objectSpy = jest.spyOn(TGQL, 'ArgsType');

      const Test = sharedObjectFactory.generateConnectionArgs("");
      const Test2 = sharedObjectFactory.generateConnectionArgs("AB");
      const Test3 = sharedObjectFactory.generateConnectionArgs("ABCD");

      expect(Test.name).toBe('ConnectionArgs');
      expect(Test2.name).toBe('ABConnectionArgs');
      expect(Test3.name).toBe('ABCDConnectionArgs');
    });
  })
})