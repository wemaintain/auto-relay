import { Container } from 'typedi'
import { InputType, ClassType, Field, registerEnumType, ArgsType } from "type-graphql"
import { PREFIX } from 'auto-relay'

export enum OrderingDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

registerEnumType(OrderingDirection, {
  name: "OrderingDirection",
  description: "Direction when sorting a column (defaults to ASC)",
});

/**
 * Create an OrderingInput inputType for graphql based on the given name and
 * enum
 * @param name name to give that inputtype
 * @param registeredEnum enum that has already been registered with Type-graphql
 */
export function orderingValueGQLFactory(
  name: string,
  registeredEnum: StandardEnum,
): ClassType<OrderingValue<any>> {
  let prefix: string = ""
  try {
    prefix = Container.get(PREFIX)
  } catch(e) { }
  const className = `${prefix}${name}OrderOptions`
  const namedClass = {
    [className]: class implements OrderingValue {
      direction?: OrderingDirection;
      sort!: StandardEnum
    }
  }
  Field(() => OrderingDirection, { defaultValue: OrderingDirection.ASC })(namedClass[className].prototype, 'direction')
  Field(() => registeredEnum)(namedClass[className].prototype, 'sort')  
  ArgsType()(namedClass[className])
  InputType(className)(namedClass[className])

  return namedClass[className] 
}


export interface OrderingValue<T extends StandardEnum<U> = any, U = any> {
  direction?: OrderingDirection
  sort: T
}

export type StandardEnum<T=any> = {
  [id: string]: T | string;
  [nu: number]: string;
}