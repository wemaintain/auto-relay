# Extending edges \(relationship metadata\)

Often, we have relationships that contains metadata. This is particulary the case for N:M relationships, where the join table might contain data our graphql client might want.

AutoRelay offers a simple API to extend the returned `Edges` with information contained in a join table.

```typescript
class EntityA {

    // [...]

    @OneToMany(() => JoinEntity)
    joinEntity: JoinEntity
}

class EntityB {

    // [...]

    @OneToMany(() => JoinEntity)
    joinEntity: JoinEntity
}

class JoinEntity {

  @Column()
  @Field()
  metadata: string;

  @ManyToOne(() => EntityA)
  entityA: EntityA

  @ManyToOne(() => EntityB)
  entityB: EntityB

}
```

Let's say we want EntityB to be queryable with Relay arguments from EntityA. Our code would simply become :

```typescript
class EntityA {

    // [...]

    @OneToMany(() => JoinEntity)
    joinEntity: JoinEntity

    @RelayedConnection(model => EntityB, through => JoinEntity)
    entitiesB: EntityB[];
}
```

This would result in the following working SDL:

```graphql
type EntityA {
  // ...
  entitiesB: EntitiesAToBConnection!
}

type EntityB {
  // ...
}

type EntitiesAToBConnection {
  edges: [EntityAToBEdge]!
  pageInfo: PageInfo!
}

type EntityAToBEdge {
  cursor: String!
  metadata: String!
  node: EntityB
}
```

### 

