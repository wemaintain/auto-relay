import { Container } from 'typedi'
import { InputType, ClassType, Field, registerEnumType, ArgsType } from "type-graphql"
import { PREFIX } from 'auto-relay'

export enum OrderingDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum OrderingNullsDirection {
  FIRST = 'FIRST',
  LAST = 'LAST',
}

registerEnumType(OrderingDirection, {
  name: "OrderingDirection",
  description: "Direction when sorting a column (defaults to ASC)",
});

registerEnumType(OrderingNullsDirection, {
  name: "OrderingNullsDirection",
  description: "Direction of nulls values when sorting a column"
})

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

  // If we already have ordering options of the same name, use them
  try {
    const alreadyExisting = Container.get<ClassType<OrderingValue<any>>>(className)
    if (alreadyExisting) return alreadyExisting
  } catch(e) {}

  // Otherwise generate them
  const namedClass = {
    [className]: class implements OrderingValue {
      direction?: OrderingDirection
      sort!: StandardEnum
      nulls?: OrderingNullsDirection
    }
  }
  Field(() => OrderingDirection, { defaultValue: OrderingDirection.ASC })(namedClass[className].prototype, 'direction')
  Field(() => registeredEnum)(namedClass[className].prototype, 'sort')  
  Field(() => OrderingNullsDirection, { nullable: true })(namedClass[className].prototype, 'nulls')
  ArgsType()(namedClass[className])
  InputType(className)(namedClass[className])

  Container.set(className, namedClass[className])

  return namedClass[className] 
}


export interface OrderingValue<T extends StandardEnum<U> = any, U = any> {
  direction?: OrderingDirection
  sort: T
  nulls?: OrderingNullsDirection
}

export type StandardEnum<T=any> = {
  [id: string]: T | string;
  [nu: number]: string;
}