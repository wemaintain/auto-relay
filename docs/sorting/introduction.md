# Introduction


### Motivation
While the first goal of AutoRelay always has been to adhere to the Relay spec, pretty quickly it became clear that more powerful features could be needed in day to day operation. The first of those were to [Extend edges](pagination-1/extending-edges-relationship-metadata.md) to add relationship metadata and later
[Extending PageInfo / Connection](pagination-1/extending-pageinfo-connection.md) to be able to implement custom desired logic such as `totalCount`.

In the same vein as those, we quickly came upon the need to implement and standardise a way to sort fields, whether be it in a `Relayed` query or not.

As to not bloat the main `auto-relay` package, all sorting features have been ported in `@auto-relay/sorting` and can be used besides or without the main pagination features.

### Quick look

Currently, the sorting package allows automatically generating all the necessary types for sorting, as well as providing simple API to convert those to input expected by ORMs.

- [x] Sorting by fields that are columns
- [x] Sorting nulls values first or last
- [ ] Sorting by custom logic (to be implemented)

```typescript
@ObjectType()
@Entity()
class Entity {

  @Column()
  @Field({ name: "fieldA" })
  public columnA: string

  @Column()
  @Field({ name: "fieldB })
  public columnB: string

}

@Resolver(type => Entity)
export class EntityResolver {

  @Query(() => [Entity])
  @Sortable()
  public async entities(
    @OrderOptions() order: TypeORMOrdering
  ) {
    return this.entityManager.findMany({ order })
  }

}
```

will generate the following working SDL:

```graphql

type Entity {
  fieldA: String!
  fieldB: String!
}

type Query {
  entities(order: [EntityOrdering!]): [Entity!]!
}

type EntityOrderOptions {
  direction: OrderingDirection = OrderingDirection.ASC
  sort: EntitySortableField
  nulls: OrderingNullsDirection
}

enum EntitySortableField {
  FieldA
  FieldB
}
```