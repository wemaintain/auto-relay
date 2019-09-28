import { ClassValueThunk, RelayedConnectionFieldOptions } from "..";
import { MethodAndPropDecorator } from "type-graphql/dist/decorators/types";
import { DynamicObjectFactory } from '../graphql/dynamic-object.factory'
import { Container } from "typedi";
import { Field } from "type-graphql";

/**
 * Mark a class parameter as being a Relay Connection, does the typing automatically for you
 * 
 * example :
 * ```typescript
 * @ObjecType()
 * export class MyObject {
 * 
 *    @RelayedField(() => CollectionObject)
 *    public collection: RelayedConnection<CollectionObject> 
 * 
 * }
 * ```
 * 
 * will generate the following SDL :
 * ```graphql
 * type MyObject {
 *    collection CollectionObjectConnection!
 * }
 * ```
 * @param type 
 */
export function RelayedField(type: ClassValueThunk): MethodAndPropDecorator
export function RelayedField<T = any>(type: ClassValueThunk<T>, options: RelayedConnectionFieldOptions): MethodAndPropDecorator
export function RelayedField(type: ClassValueThunk, through: ClassValueThunk): MethodAndPropDecorator
export function RelayedField<T = any>(type: ClassValueThunk, through: ClassValueThunk<T>, options: RelayedConnectionFieldOptions): MethodAndPropDecorator
export function RelayedField(type: ClassValueThunk, throughOrOptions?: ClassValueThunk | RelayedConnectionFieldOptions, options?: RelayedConnectionFieldOptions): MethodAndPropDecorator {
  return (target: any, propertyKey: string | symbol) => {
    let through: ClassValueThunk | undefined

    if (typeof throughOrOptions === "function") {
      through = throughOrOptions
    } else {
      options = throughOrOptions
    }

    process.nextTick(() => {
      // Create GQL Stuff
      const dynamicObjectFactory = Container.get(DynamicObjectFactory)
      const { Connection } = dynamicObjectFactory.getEdgeConnection(type, through, { field: options })

      Field(() => Connection, options)(target, propertyKey)
    })
  }
}