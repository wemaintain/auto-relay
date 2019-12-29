import { ClassValueThunk } from 'auto-relay'
import { getConnectionManager, Connection } from 'typeorm'

/**
 * Helper function to find the connection the supplied entity is 
 * registered in
 */
export function connectionFinderForEntity(entity: ClassValueThunk) {
  for(const connection of getConnectionManager().connections) {
    const test = connection.entityMetadatas.find((em) => em.target === entity())
    if (test) return connection
  }

  throw new Error(`Couldn't find connection for entity ${entity().name}`)
}