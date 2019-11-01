import { ObjectType, Field, Root } from "type-graphql";
import * as Relay from 'graphql-relay'
import { RelayLimitOffset } from "auto-relay";
import { RelayNbOfItems } from "auto-relay/decorators/relayed-nb-of-items.decorator";

@ObjectType({ isAbstract: true })
export class ExtendedPageInfo {

  @Field()
  public test: string = "test"

  @Field(() => String)
  public decoratorTest(
    @Root() test: Relay.PageInfo,
    @RelayNbOfItems() nbOfItem: number
  ) {

    expect(test).toBeTruthy()
    expect(test.endCursor).toBeString()
    expect(test.hasNextPage).toBeDefined()
    expect(test.hasPreviousPage).toBeDefined()
    expect(test.startCursor).toBeString()

    expect(nbOfItem).toBeDefined()
    expect(nbOfItem).toBeNumber()

    return "decoratortest"
  }

}