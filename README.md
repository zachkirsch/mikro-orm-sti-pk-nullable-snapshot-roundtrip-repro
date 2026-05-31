# STI primary key is serialized `nullable: true` when a child re-declares it (Postgres)

In single-table inheritance, when a child entity re-declares the inherited `@PrimaryKey`, the **root** entity's primary-key column is treated as a subtype-specific column and marked `"nullable": true`. Because the column is a primary key it is actually `NOT NULL`, so the metadata is self-contradictory:

- `migration:create` emits the PK column as nullable — `create table "animal" ("id" varchar(255) null, ..., primary key ("id"))` — and records `"nullable": true` in the snapshot.
- `migrator.up()` then rewrites the snapshot from introspection (`nullable: false`), dirtying the committed file even though nothing changed; `migration:create` run again wants to `alter column "id" set not null`.

## Why re-declare the PK? (this is not gratuitous)

Re-declaring the primary key on STI children is the standard way to give each subtype **its own branded id type** and **its own id default/prefix** — neither of which the abstract base can provide, since the base cannot know each subtype's prefix:

```ts
@Entity({ discriminatorValue: "dog" })
export class Dog extends Animal {
  @PrimaryKey({ type: "string" })
  id: DogId = makeId<DogId>("dog"); // own branded type + own "dog_..." prefix
}
```

This is exactly the common `id = generateRid<DogId>("dog")` pattern. Without re-declaring, every subtype's `id` is the base type with the base default, losing per-subtype type safety and id prefixes. The re-declaration is semantically identical to the inherited PK (same column, same type, same primary key), so it should be a no-op at the schema level.

## Repro

```
# terminal 1
docker compose up

# terminal 2
npm install
npm run repro   # runs orm.migrator.up()
git diff        # src/migrations/.snapshot-postgres.json has been rewritten
```

Expected: clean `git diff`, and a primary key that is `NOT NULL` in the generated migration.

Actual: the snapshot records the PK as nullable and `migrator.up()` flips it:

```diff
           "primary": true,
-          "nullable": true,
+          "nullable": false,
```

## Root cause

The STI property-merge in `MetadataDiscovery` re-adds the child's (inherited) PK to the root with `nullable = true` (intended for genuinely subtype-specific columns), which clobbers the root primary key's NOT NULL.

## Versions

`@mikro-orm/*@next` (7.1.4-dev.0), Postgres 17.
