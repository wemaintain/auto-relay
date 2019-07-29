import { SharedObjectFactory } from './../graphql/shared-object.factory'
import { Container, Service } from 'typedi'
import { TypeRelayConfigArgs, TypeRelayConfigArgsExistingModel, TypeRelayConfigArgsNoModel } from '../interfaces/auto-relay-config.interface'

@Service()
export class TypeRelayConfig {
  protected _sharedObjectFactory: SharedObjectFactory = Container.get(SharedObjectFactory)

  constructor (config?: TypeRelayConfigArgs) {
    Container.remove('PAGINATION_OBJECT', 'CONNECTIONARGS_OBJECT')

    if (config && (config as TypeRelayConfigArgsExistingModel).objects) {
      this._declareExistingObjects(config as TypeRelayConfigArgsExistingModel)
    } else {
      const prefix = config && (config as TypeRelayConfigArgsNoModel).microserviceName ? String((config as TypeRelayConfigArgsNoModel).microserviceName) : ''
      this._generateObjects(prefix)
    }
  }

  protected _declareExistingObjects (config: TypeRelayConfigArgsExistingModel): void {
    Container.set('PAGINATION_OBJECT', config.objects.pagination)
    Container.set('CONNECTIONARGS_OBJECT', config.objects.connectionArgs)
  }

  protected _generateObjects (prefix: string): void {
    const ConnectionArgs = this._sharedObjectFactory.generateConnectionArgs(prefix)
    const PageInfo = this._sharedObjectFactory.generatePageInfo(prefix)

    Container.set('PAGINATION_OBJECT', (): typeof PageInfo => PageInfo)
    Container.set('CONNECTIONARGS_OBJECT', (): typeof ConnectionArgs => ConnectionArgs)
  }
}
