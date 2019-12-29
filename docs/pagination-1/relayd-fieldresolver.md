---
description: Adding relay to a FieldResolver (almost) automatically
---

# Relay'd FieldResolver

In some scenarios we might need finer control on the fetching logic, while still taking advantage of the automatic ObjectTypes creation. AutoRelay offers two decorators for that job : `@RelayedField` and `@RelayedFieldResolver`

```typescript
@Resolver(of => MyObject)
export class MyResolver {

    constructor(
      protected readonly myRepository: Repository<MyNestedObject>
    ) {}

    @RelayedFieldResolver(() => MyNestedObject)
    public async collection(
      @RelayLimitOffset() { limit, offset }: RelayLimitOffsetArgs
    ): Promise<[number, MyNestedObject[]]> {

      return this.myRepository.findAndCount({ 
        where: { 
          // any business logic you might have
        },
        skip: offset,
        take: limit
      })

    }

}
```

And that's it! Again, AutoRelay has taken care under the hood of a few things: 

1. It's created all the necessary GraphQL types for us
2. It's ensured the `users` query expects Connection Arguments, but conveniently translated them to limit/offset for us.
3. It takes the return of our `findAndCount` calls and automatically transforms it to a Relay `Connection` as expected by GraphQL.

In situations where you want your field to appear in the SDL, but do not want to actually create the resolver logic, AutoRelay provides a `@RelayedField` decorator that acts the same way as `@Field` while still providing a shorthand to creating Collection types.

```typescript
export class MyObject {

  @RelayedField(() => MyNestedObject)
  collection: AugmentedConnection<MyNestedObject>

}
```

### 

