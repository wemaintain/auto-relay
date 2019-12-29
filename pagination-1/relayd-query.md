# Relay'd Query

Similarly we might need to paginate a `Query` field using AutoRelay but have complete control over the business logic and fetching. AutoRelay offers `@RelayedQuery` for that.

```typescript
@Resolver(of => User)
export class UserResolver {

  constructor(
    protected readonly userRepository: Repository<User>
  )

  @RelayedQuery(() => User)
  async users(
    @RelayLimitOffset() {limit, offset}: RelayLimitOffsetArgs
  ): Promise<[number, User[]]> {
    return this.userRepository.findAndCount({ 
      where: { 
        // any business logic you might have
      },
      skip: offset,
      take: limit
    })
  }

}
```

Notice the API is exactly the same as `@RelayedFieldResolver`. Just like in vanilla type-graphql `@RelayedQuery` is nothing more than an alias for calling `@RelayedFieldResolver` on a field of the `Query` Object.

