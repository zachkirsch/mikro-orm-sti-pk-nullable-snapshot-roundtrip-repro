# STI primary key is treated as `nullable` when a child re-declares it (postgres)

In single-table inheritance, when a child entity re-declares the inherited `@PrimaryKey`, the **root** primary-key column is marked `nullable: true` in metadata. Because it's a primary key it is actually `NOT NULL`, so MikroORM's own schema generator contradicts itself:

- the generated `CREATE TABLE` declares the PK column as `null`, and
- `schema:update` against an in-sync database wants to **drop NOT NULL from the primary key**.

## Repro

```
# terminal 1
docker compose up

# terminal 2
npm install
npm run repro
```

Output:

```
metadata: animal.id primary=true nullable=true

=== getCreateSchemaSQL (note the primary key column) ===

create table "animal" ("id" varchar(255) null, "type" text not null, ..., primary key ("id"));

=== schema:update against an in-sync database (expected: empty) ===

alter table "animal" alter column "id" drop not null;
```

## Why re-declare the PK? (this is not gratuitous)

Re-declaring the primary key on STI children is the standard way to give each subtype **its own branded id type** and **its own id default/prefix** — neither of which the abstract base can provide, since the base cannot know each subtype's prefix:

```ts
@Entity({ discriminatorValue: "dog" })
export class Dog extends Animal {
  @PrimaryKey({ type: "string" })
  id: DogId = makeId<DogId>("dog"); // own branded type + own "dog_..." prefix
}
```

This is the common `id = generateRid<DogId>("dog")` pattern. The re-declaration is semantically identical to the inherited PK (same column, same type, same primary key), so it should be a no-op — instead it flips the root PK to nullable.

## Root cause

The STI property-merge in `MetadataDiscovery` re-adds the child's (inherited) primary key to the root with `nullable = true` (intended for genuinely subtype-specific columns), which clobbers the root primary key's NOT NULL.

## Versions

`@mikro-orm/*@next` (7.1.4-dev.0), Postgres 17.
