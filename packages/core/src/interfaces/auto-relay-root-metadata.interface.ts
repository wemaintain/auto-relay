/**
 * A root graphql object that has been augmented with autorelay metadata
 */
export interface AutoRelayRoot {
  _autoRelayMetadata: AutoRelayRootMetadata
}

/**
 * Metadatas on a given root as added for internal comsumption
 */
export interface AutoRelayRootMetadata {
  /** total number of items found for the current query */
  totalItems: number
}