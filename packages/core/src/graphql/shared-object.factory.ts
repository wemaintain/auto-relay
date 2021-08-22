/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Service } from 'typedi'
import { Field, ObjectType, ArgsType, Int, InputType } from 'type-graphql'
import * as Relay from 'graphql-relay'
import { ClassValueThunk } from '..'

/**
 * Factory service for shared object/arguments needed for Relay in the SDL
 */
@Service()
export class SharedObjectFactory {
  /**
   * Generate the PageInfo type-graphql class, decorated so it is auto-inserted
   * in the SDL
   *
   * @param prefix prefix for the name of the PageInfo object in the SDL.
   * @param extending Function returning a type we want PageInfo to extend
   */
  public generatePageInfo<T = any>(prefix: string, extending?: ClassValueThunk<T>): new () => (Relay.PageInfo & T) {
    const pageInfoName = `${prefix}PageInfo`
    const extend = extending ? extending() : Object

    const PageInfo = class extends (extend as ObjectConstructor) implements Relay.PageInfo {
      public hasNextPage!: boolean;
      public hasPreviousPage!: boolean;
      public startCursor!: Relay.ConnectionCursor | null;
      public endCursor!: Relay.ConnectionCursor | null;
    }

    Field(() => Boolean)(PageInfo.prototype, 'hasNextPage')
    Field(() => Boolean)(PageInfo.prototype, 'hasPreviousPage')
    Field(() => String, { nullable: true })(PageInfo.prototype, 'startCursor')
    Field(() => String, { nullable: true })(PageInfo.prototype, 'endCursor')
    ObjectType(pageInfoName)(PageInfo)

    return PageInfo as any
  }

  /**
   * Generate the ConnectionArgs Arguments type-graphql class, decorated so it is auto-inserted
   * in the SDL
   * @param prefix prefix for the name of the ConnectionArgs in the SDL
   */
  public generateConnectionArgs(prefix: string): new () => Relay.ConnectionArguments {
    if (!prefix) prefix = ''
    const argsName = `${prefix}ConnectionArgs`
    // This is a trick so the local class will be called argsName, as the ArgsType decorator doesn't take
    // a name argument and instead uses the class name in the SDL.
    const darkMagic = {
      [argsName]: class implements Relay.ConnectionArguments {
        public before?: Relay.ConnectionCursor;

        public after?: Relay.ConnectionCursor;

        public first?: number;

        public last?: number;
      },
    }

    Field(() => String, { nullable: true, description: 'Paginate before opaque cursor' })(darkMagic[argsName].prototype, 'before')
    Field(() => String, { nullable: true, description: 'Paginate after opaque cursor' })(darkMagic[argsName].prototype, 'after')
    Field(() => Int, { nullable: true, description: 'Paginate first' })(darkMagic[argsName].prototype, 'first')
    Field(() => Int, { nullable: true, description: 'Paginate last' })(darkMagic[argsName].prototype, 'last')

    ArgsType()(darkMagic[argsName])
    InputType(argsName)(darkMagic[argsName])
    return darkMagic[argsName]
  }
}
