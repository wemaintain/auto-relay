---
description: >-
  Automatically relaying a relationship between two entities in your ORM of
  choice
---

# Relay'd Relationship

### Making a relationship relayable.

Let's say you currently have two entities / graphql objects, `User` and `Recipe`. A recipe is always linked to an user, and a given user can have multiple recipes. Your classes might look like that :

```typescript
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  name: string;

  @OneToMany(() => Recipe)
  @Field(() => [Recipe])
  recipes: Recipe[]
}

export class Recipe {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field(() => Int)
  rating: number

  @ManyToOne(() => User)
  user: User
}
```

With some custom logic \(either lazy-loading or field resolvers\) to fetch User.recipes / Recipe.user.

With AutoRelay, we're gonna replace all that logic with a single decorator, `@RelayedConnection`.

Our `User` will now look like this :

```typescript
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  name: string;

  @OneToMany(() => Recipe)
  @RelayedConnection(() => Recipe)
  recipes: Recipe[]
}
```

This will auto-magically create a few GraphQL types, such as `UserRecipeConnection` and `UserRecipeEdge`. Our User.recipes field now takes Relay's ConnectionArguments and returns `UserRecipeConnection!`.

Our TypeORM integration gets the repository for `Recipe`, translates the ConnectionArguments to an offset/limit tuple and fetches recipes connected to this `User`.

#### Default sorting

`@RelayedConnection` can optionally accept an order parameter in its options, that will allow you to fetch while sorting on the column of your entities. For example, if we wanted to get our recipes by best ratings :

```typescript
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  name: string;

  @OneToMany(() => Recipe)
  @RelayedConnection(() => Recipe, { order: { rating: 'DESC' } })
  recipes: Recipe[]
}
```

{% hint style="info" %}
If you need more in depth sorting, check-out the docs for `@auto-relay/sorting`
{% endhint %}

