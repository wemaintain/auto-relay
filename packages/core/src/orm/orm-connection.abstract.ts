import { RelayedConnectionOptions } from './../decorators/relayed-connection.decorator';
/* eslint-disable @typescript-eslint/no-type-alias */
import { ClassValueThunk } from '..'
import { AugmentedConnection } from '../interfaces/augmented-connection.interface'
import * as Relay from 'graphql-relay'

export abstract class ORMConnection {

  public abstract autoRelayFactory<T=any, Y=any>(field: string, self: ClassValueThunk, type: ClassValueThunk<T>, through?: ClassValueThunk<Y>, options?: RelayedConnectionOptions<Y>): AutoRelayGetter<T, Y>
  public abstract autoRelayFactory<T=any>(field: string, self: ClassValueThunk, type: ClassValueThunk<T>, through?: undefined, options?: RelayedConnectionOptions<T>): AutoRelayGetter<T, never>

}

export type AutoRelayGetter<T=any, Y=any> =
  (after?: Relay.ConnectionCursor, first?: number, before?: Relay.ConnectionCursor, last?: number)
  => AugmentedConnection<T, Y> | Promise<AugmentedConnection<T, Y>>
