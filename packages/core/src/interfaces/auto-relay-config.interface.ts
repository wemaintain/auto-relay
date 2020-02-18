import { LimitOffsetOptions } from './../decorators/relayed-query.decorator'
import { TypeValueThunk, ClassValueThunk } from '../types/types'
import { ORMConnection } from '../orm/orm-connection.abstract'
import * as Relay from "graphql-relay"

/**
 * Arguments to initialize AutoRelay's config
 */
export type AutoRelayConfigArgs = AutoRelayConfigArgsExistingModel | AutoRelayConfigArgsNoModel;

export type AutoRelayOrmConnect<T extends ORMConnection = ORMConnection> = () => new () => T

export interface AutoRelayConfigArgsBase {
  /** which ORM to use for the auto-relaying, see readme for available ORMs */
  orm: AutoRelayOrmConnect
  /** global sort options */
  sort?: {

  },
  /** global pagination options */
  pagination?: LimitOffsetOptions
}

export interface AutoRelayConfigArgsExistingModel extends AutoRelayConfigArgsBase {
  /** the objects we should use in the generated SDL */
  objects: {
    /** should be a type-graphql decorated type for pagination */
    pageInfo: ClassValueThunk<Relay.PageInfo>
    /** should be a type-graphql decorated type for connection args */
    connectionArgs: ClassValueThunk<Relay.ConnectionArguments>
  }
}

export interface AutoRelayConfigArgsNoModel extends AutoRelayConfigArgsBase {
  /** microservice name, will be prefixed to the generated SDL for shared Objects */
  microserviceName?: string
  /** used to extend dynamically generated object */
  extends?: {
    /** extend the PageInfo object with the following abstract ObjectType */
    pageInfo?: ClassValueThunk<any>
    /** extend the Connection object with the following abstract ObjectType */
    connection?: ClassValueThunk<any>
  }
}
