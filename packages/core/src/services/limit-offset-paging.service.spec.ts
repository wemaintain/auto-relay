import { LimitOffsetPagingService } from './limit-offset-paging.service';
import * as Relay from 'graphql-relay'

describe('Limit/Offset Paging Service', () => {

  let pagingService = new LimitOffsetPagingService();

  beforeEach(() => {
    pagingService = new LimitOffsetPagingService();
  })

  describe('getLimitOffset', () => {

    it('Should return everything', () => {
      const results = pagingService.getLimitOffset({ });

      expect(results).toBeTruthy();
      expect(results.limit).toBeNil();
      expect(results.offset).toBeNil();
    });

    it('Should get the first n elements', () => {
      const results = pagingService.getLimitOffset({ first: 5 });

      expect(results.limit).toBe(5);
      expect(results.offset).toBe(0);
    });

    it('Should get the first n elements after given cursor', () => {
      const currentCursor = Relay.toGlobalId('test', '5');
      const results = pagingService.getLimitOffset({ first: 3, after: currentCursor });

      expect(results.limit).toBe(3);
      expect(results.offset).toBe(5 + 1);
    })

    it('Should get the last n elements before given cursor', () => {
      const currentCursor = Relay.toGlobalId('test', '5');
      const results = pagingService.getLimitOffset({ last: 3, before: currentCursor });

      expect(results.limit).toBe(3);
      expect(results.offset).toBe(5 - 3);
    });

    it('Should get the last n elements before given cursor, without underflow', () => {
      const currentCursor = Relay.toGlobalId('test', '2');
      const results = pagingService.getLimitOffset({ last: 3, before: currentCursor });

      expect(results.limit).toBe(2);
      expect(results.offset).toBe(0);
    });

    it('Should throw when arguments are ambiguous on forward or backward paging', () => {
      expect(() => pagingService.getLimitOffset({ last: 3, first: 2 })).toThrow(/forwards AND backwards/);
    });

    it('Should throw when paging forward with invalid args', () => {
      expect(() => pagingService.getLimitOffset({ first: 5, before: 'abcd' })).toThrow(/first\/after/);
      expect(() => pagingService.getLimitOffset({ first: -2, after: Relay.toGlobalId('test', '2') })).toThrow(/must be positive/);
    })


    it('Should throw when paging backwards with invalid args', () => {
      expect(() => pagingService.getLimitOffset({ last: 5, after: 'abcd' })).toThrow(/first\/after/);
      expect(() => pagingService.getLimitOffset({ last: -2, before: Relay.toGlobalId('test', '2') })).toThrow(/must be positive/);
    });

    it('Should throw when paging backwards without a cursor', () => {
      expect(() => pagingService.getLimitOffset({ last: 6 })).toThrow(/'before' argument is required/);
      
    })


  })
})