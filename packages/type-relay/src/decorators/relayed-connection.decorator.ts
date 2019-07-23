import { ReturnTypeFunc, MethodAndPropDecorator } from '../types/types'

export function RelayedConnection (type: ReturnTypeFunc): MethodAndPropDecorator
export function RelayedConnection (type: ReturnTypeFunc, through: ReturnTypeFunc): MethodAndPropDecorator
export function RelayedConnection (type: ReturnTypeFunc, through?: ReturnTypeFunc): MethodAndPropDecorator {
  return <M>(target: any, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<M>) => {
    
  }
}
