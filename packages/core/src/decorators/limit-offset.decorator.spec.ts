import { RelayLimitOffsetArgs } from './../interfaces/relay-limit-offset-arg.interface';
import { LimitOffsetPagingService } from './../services/limit-offset-paging.service'
import { RelayLimitOffsetResolverFactory } from './limit-offset.decorator';


const limitOffsetService = new LimitOffsetPagingService();
const assertLimitOffsetFromArgs = (test: RelayLimitOffsetArgs, args: any) => {
  expect(test).toBeTruthy();
  expect(args).toBeTruthy();

  expect(test).toEqual({ ...limitOffsetService.getLimitOffset(args), _originalArgs: args })
}

describe('Limit offset decorator', () => {
  it('Should return offset/limit from inline args', () => {
    const tests: any[] = [
      {},
      { first: 5 },
      { first: 5, after: 'acvx' },
      { last: 5, before: 'dfsfsd' }
    ]

    const RelayLimitOffsetResolver = RelayLimitOffsetResolverFactory({}, '');

    tests.forEach((args) => {
      assertLimitOffsetFromArgs(RelayLimitOffsetResolver({ args }), args)
    })
  })

  it('Should return offset/limit from input type', () => {
    const TestClass = class { }
    Reflect.defineMetadata('autorelay:connectionArgs:key', 'paginationProperty', TestClass.prototype, 'test')
    const tests: any[] = [
      { paginationProperty: {} },
      { paginationProperty: { first: 5 }, first: 3 },
      { paginationProperty: { first: 5, after: 'acvx' }, first: 3, after: 'fdsf' },
      { paginationProperty: { last: 5, before: 'dfsfsd' }, last: 5, before: 'dsfdsf' }
    ]

    const RelayLimitOffsetResolver = RelayLimitOffsetResolverFactory(TestClass.prototype, 'test');

    tests.forEach((args) => {
      assertLimitOffsetFromArgs(RelayLimitOffsetResolver({ args }), args.paginationProperty)
    })
  })


})