import { TypeValueThunk } from '../types/types'

/**
 * Arguments to initialize TypeRelay's config
 */
// eslint-disable-next-line @typescript-eslint/no-type-alias
export type TypeRelayConfigArgs = TypeRelayConfigArgsExistingModel | TypeRelayConfigArgsNoModel;

export interface TypeRelayConfigArgsBase {
  orm: 'type-orm'
}

export interface TypeRelayConfigArgsExistingModel extends TypeRelayConfigArgsBase {
  /** the objects we should use in the generated SDL */
  objects: {
    /** should be a type-graphql decorated type for pagination */
    pagination: TypeValueThunk
    /** should be a type-graphql decorated type for connection args */
    connectionArgs: TypeValueThunk
  }
}

export interface TypeRelayConfigArgsNoModel extends TypeRelayConfigArgsBase {
  /** microservice name, will be prefixed to the generated SDL for shared Objects */
  microserviceName?: string
}
