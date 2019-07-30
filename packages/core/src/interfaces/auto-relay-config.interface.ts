import { TypeValueThunk } from '../types/types'

/**
 * Arguments to initialize AutoRelay's config
 */
// eslint-disable-next-line @typescript-eslint/no-type-alias
export type AutoRelayConfigArgs = AutoRelayConfigArgsExistingModel | AutoRelayConfigArgsNoModel;

export interface AutoRelayConfigArgsBase {
  orm: 'type-orm'
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
