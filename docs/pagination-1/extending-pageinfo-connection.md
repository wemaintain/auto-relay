# Extending PageInfo / Connection

## Bi-directional PageInfo

The Relay specs by default does not compute hasPreviousPage when paging forwards, and does not compute hasNextPage when paging forwards ([see this issue for details](https://github.com/graphql/graphql-relay-js/issues/58)) as it may be expensive to compute them. However, as many usecases of AutoRelay (mainly while fetching from a main database with limit/offset) do provide a very inexpensive way to compute that data, a `biDirectionalPageInfo` option has been created to allow calculating both those arguments from the first/last arguments and the entity count returned.

This option can be set globally or per query/field resolver

*globally*
```typescript
new AutoRelayConfig({ pagination: { biDirectionalPageInfo: true } })
```

*per query*
```typescript
@RelayedQuery(() => MyEntity, { biDirectionalPageInfo: true })
public async myEntities() {

}
```


## Adding your own logic

AutoRelay allows extending `PageInfo` and `Connection` Objects with your own base classes. This can be useful for augmenting the Relay spec. The following example shows how to add a "totalCount" field containing the total number of items matching a paginated query

_src/base-connection.ts_

```typescript
import { RelayNbOfItems } from 'auto-relay'

@ObjectType({ isAbstract: true })
export class BaseConnection {

  @Field(() => Int)
  public totalCount(
    @RelayNbOfItems() nbOfItem: number
  ): number {
    return nbOfItem;
  }

}
```

_src/index.ts_

```typescript
new AutoRelayConfig({ extends: { connection: () => BaseConnection } })
```

this will result in all Connection objects being augmented with the `totalCount` field

