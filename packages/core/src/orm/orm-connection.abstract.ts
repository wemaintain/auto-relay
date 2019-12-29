/* eslint-disable @typescript-eslint/no-type-alias */
import { ClassType } from 'type-graphql'
import { RelayedConnectionOptions } from './../decorators/relayed-connection.decorator';
import { ClassValueThunk } from '..'
import { AugmentedConnection } from '../interfaces/augmented-connection.interface'
import * as Relay from 'graphql-relay'

export abstract class ORMConnection {

  public abstract autoRelayFactory<T=any, Y=any>(field: string, self: ClassValueThunk, type: ClassValueThunk<T>, through?: ClassValueThunk<Y>, options?: RelayedConnectionOptions<Y>): AutoRelayGetter<T, Y>
  public abstract autoRelayFactory<T=any>(field: string, self: ClassValueThunk, type: ClassValueThunk<T>, through?: undefined, options?: RelayedConnectionOptions<T>): AutoRelayGetter<T, undefined>

  /** 
   * For an object that is an Entity, returns the columns names of given fields
   * 
   * example:
   * ```typescript
   * @Entity()
   * export class MyEntity {
   *    @Column({ name: "bar" })
   *    public foo: string
   * }
   * 
   * getColumnsOfFields(() => MyEntity, ["foo"]) // { "foo": "bar" }
   * ```
   **/
  public abstract getColumnsOfFields(entity: ClassValueThunk, keys: string[]): Record<string, string | undefined>
}

export type AutoRelayGetter<T=any, Y=any> =
  (after?: Relay.ConnectionCursor, first?: number, before?: Relay.ConnectionCursor, last?: number)
  => AugmentedConnection<T, Y> | Promise<AugmentedConnection<T, Y>>
