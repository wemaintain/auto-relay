# Extending PageInfo / Connection

AutoRelay allows extending `PageInfo` and `Connection` Objects with your own base classes. This can be useful for augmenting the Relay spec. The following example shows how to add a "totalCount" field containing the total number of items matching a paginated query

_src/base-connection.ts_

```typescript
import { RelayNbOfItems } from 'auto-relay'

@ObjectType({ abstract: true })
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

