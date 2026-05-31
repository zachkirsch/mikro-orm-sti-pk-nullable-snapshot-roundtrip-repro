# STI primary key is serialized `nullable: true` when a child re-declares it (Postgres)

In single-table inheritance, if a child entity re-declares the inherited `@PrimaryKey`, the **root** entity's primary-key column is written to the snapshot as `"nullable": true`. The database column is `NOT NULL` (it's a `primary key`), so:

- the snapshot authored by `migration:create` is already wrong (a primary key marked nullable), and
- `migrator.up()` rewrites the snapshot from introspection (`nullable: false`), dirtying the committed file even though nothing changed. `migration:create` would also emit a spurious `alter column "id" set not null`.

Re-declaring the PK on STI children is common (e.g. to attach a child-specific branded id type or repository). Removing the child `@PrimaryKey` lines makes the bug disappear.

## Repro

```
# terminal 1
docker compose up

# terminal 2
npm install
npm run repro   # runs orm.migrator.up()
git diff        # src/migrations/.snapshot-postgres.json has been rewritten
```

Expected: clean `git diff`.

Actual: the migration creates the column as `NOT NULL`...

```sql
create table "animal" ("id" serial primary key, "type" text not null, ...);
```

...but the snapshot records the primary key as nullable, and `migrator.up()` flips it back:

```diff
           "autoincrement": true,
           "primary": true,
-          "nullable": true,
+          "nullable": false,
```

## Root cause

`Dog`/`Cat` re-declare the inherited primary key:

```ts
@Entity({ discriminatorValue: "dog" })
export class Dog extends Animal {
  @PrimaryKey({ type: "number" })
  id!: number; // re-declared -> root Animal.id becomes nullable in metadata
  ...
}
```

The STI property-merge in `MetadataDiscovery` re-adds the child's inherited PK to the root with `nullable = true` (intended for subtype-specific columns), which clobbers the root primary key's NOT NULL.

## Versions

`@mikro-orm/*@next` (7.1.4-dev.0), Postgres 17.
