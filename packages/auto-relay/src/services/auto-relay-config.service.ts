import { SharedObjectFactory } from '../graphql/shared-object.factory'
import { Container, Service } from 'typedi'
import { AutoRelayConfigArgs, AutoRelayConfigArgsExistingModel, AutoRelayConfigArgsNoModel } from '../interfaces/auto-relay-config.interface'

@Service()
export class AutoRelayConfig {
  protected _sharedObjectFactory: SharedObjectFactory = Container.get(SharedObjectFactory)

  constructor (config?: AutoRelayConfigArgs) {
    Container.remove('PAGINATION_OBJECT', 'CONNECTIONARGS_OBJECT')

    if (config && (config as AutoRelayConfigArgsExistingModel).objects) {
      this._declareExistingObjects(config as AutoRelayConfigArgsExistingModel)
    } else {
      const prefix = config && (config as AutoRelayConfigArgsNoModel).microserviceName ? String((config as AutoRelayConfigArgsNoModel).microserviceName) : ''
      this._generateObjects(prefix)
    }
  }

  protected _declareExistingObjects (config: AutoRelayConfigArgsExistingModel): void {
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
