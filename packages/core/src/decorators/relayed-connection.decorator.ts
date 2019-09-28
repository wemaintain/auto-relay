import { NoORMError } from './../errors/no-orm.error';
import { AdvancedOptions } from 'type-graphql/dist/decorators/types';
import { ORMConnection } from '../orm/orm-connection.abstract'
import { Container } from 'typedi'
import { MethodAndPropDecorator, ClassValueThunk } from '../types/types'
import { DynamicObjectFactory } from '../graphql/dynamic-object.factory'
import { ORM_CONNECTION } from './../services/auto-relay-config.service';

export function RelayedConnection(type: ClassValueThunk): MethodAndPropDecorator
export function RelayedConnection<T=any>(type: ClassValueThunk<T>, options: RelayedConnectionOptions<T>): MethodAndPropDecorator
export function RelayedConnection(type: ClassValueThunk, through: ClassValueThunk): MethodAndPropDecorator
export function RelayedConnection<T=any>(type: ClassValueThunk, through: ClassValueThunk<T>, options: RelayedConnectionOptions<T>): MethodAndPropDecorator
export function RelayedConnection (type: ClassValueThunk, throughOrOptions?: ClassValueThunk | RelayedConnectionOptions, options?: RelayedConnectionOptions): MethodAndPropDecorator {
  return <M>(target: any, propertyKey: string | symbol) => {
    let through: ClassValueThunk | undefined
    
    if(typeof throughOrOptions === "function") {
      through = throughOrOptions
    } else {
      options = throughOrOptions
    }

    process.nextTick(() => {
      const getterName = `relayField${String(propertyKey)}Getter`
      const capitalized = String(propertyKey).charAt(0).toUpperCase() + String(propertyKey).slice(1)

      // Create GQL Stuff
      const dynamicObjectFactory = Container.get(DynamicObjectFactory)
      const { Connection } = dynamicObjectFactory.getEdgeConnection(type, through, options)
      dynamicObjectFactory.declareFunctionAsRelayInSDL(target, getterName, propertyKey, Connection, options)

      // Create the actual Relay'd getter
      try {
        const ormConnection = Container.get(ORM_CONNECTION)
        const ORM = ormConnection()
        const orm = new ORM()
  
        target[getterName] = orm.autoRelayFactory(
          String(propertyKey),
          () => (target as new () => unknown),
          type,
          through as ClassValueThunk,
          options
        )
      } catch(e) {
        if(e && e.name === "ServiceNotFoundError") {
          // ORMConnection wasn't loaded. Our relay factory can't ever work.
          target[getterName] = () => { throw new NoORMError() }
        } else {
          throw e;
        }
      }
    })
  }
}

/**
 * Options while automatically fetching a connection
 */
export interface RelayedConnectionOptions<Entity=any> {
  /** how to order the returned results */
  order?: {
    [P in keyof Entity]?: "ASC" | "DESC" | 1 | -1;
  };
  /** 
   * TypeGraphQL field's options.
   **/
  field?: RelayedConnectionFieldOptions
}

export interface RelayedConnectionFieldOptions extends Omit<AdvancedOptions, 'defaultValue'> {
  /** 
   * Note that AutoRelay will always return pageInfos and edges/nodes
   * So the only available options is to make the items nullable for collections
   * that might be empty.
   */
  nullable?: 'items'
}