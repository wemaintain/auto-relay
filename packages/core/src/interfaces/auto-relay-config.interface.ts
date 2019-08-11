import { TypeValueThunk } from '../types/types'
import { ORMConnection } from '../orm/orm-connection.abstract'

/**
 * Arguments to initialize AutoRelay's config
 */
export type AutoRelayConfigArgs = AutoRelayConfigArgsExistingModel | AutoRelayConfigArgsNoModel;

export type AutoRelayOrmConnect<T extends ORMConnection = ORMConnection> = () => new () => T

export interface AutoRelayConfigArgsBase {
  /** which ORM to use for the auto-relaying, see readme for available ORMs */
  orm: AutoRelayOrmConnect
}

export interface AutoRelayConfigArgsExistingModel extends AutoRelayConfigArgsBase {
  /** the objects we should use in the generated SDL */
  objects: {
    /** should be a type-graphql decorated type for pagination */
    pagination: TypeValueThunk
    /** should be a type-graphql decorated type for connection args */
    connectionArgs: TypeValueThunk
  }
}

export interface AutoRelayConfigArgsNoModel extends AutoRelayConfigArgsBase {
  /** microservice name, will be prefixed to the generated SDL for shared Objects */
  microserviceName?: string
}
