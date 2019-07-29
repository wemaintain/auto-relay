import { ClassValueThunk } from '..'
import * as Relay from 'graphql-relay'
import { AugmentedConnection } from '../interfaces/augmented-connection.interface'

export abstract class ORMConnection {
  public abstract findRelayedEntityFunctionFactory<T=any, Y=any>(field: string, self: ClassValueThunk, type: ClassValueThunk<T>, through: ClassValueThunk<Y>): AugmentedConnection<T, Y> | Promise<AugmentedConnection<T, Y>>

  public abstract findRelayedEntityFunctionFactory<T=any>(field: string, self: ClassValueThunk, type: ClassValueThunk<T>): Relay.Connection<T> | Promise<Relay.Connection<T>>
}
