import { ObjectType, Field, Root } from "type-graphql";
import * as Relay from 'graphql-relay'
import { RelayLimitOffset } from "auto-relay";
import { RelayNbOfItems } from "auto-relay/decorators/relayed-nb-of-items.decorator";

@ObjectType({ isAbstract: true })
export class ExtendedConnection {

  @Field()
  public test: string = "test"

  @Field(() => String)
  public decoratorTest(
    @Root() test: Relay.Connection<any>,
    @RelayNbOfItems() nbOfItem: number
  ) {

    expect(test).toBeTruthy()
    expect(test.edges).toBeTruthy()
    expect(test.pageInfo).toBeTruthy()

    expect(nbOfItem).toBeDefined()
    expect(nbOfItem).toBeNumber()

    return "decoratortest"
  }

}