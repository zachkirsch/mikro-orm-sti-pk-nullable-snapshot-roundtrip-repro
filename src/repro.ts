import { MikroORM } from "@mikro-orm/postgresql";

import config from "./mikro-orm.config.ts";

void (async () => {
  const orm = await MikroORM.init(config);

  // What MikroORM thinks the primary key should be, straight from metadata.
  const target = orm.schema.getTargetSchema().getTable("animal")!;
  const id = target.getColumns().find((c) => c.name === "id")!;
  console.log(`metadata: animal.id primary=${id.primary} nullable=${id.nullable}\n`);

  // The CREATE SQL it generates for that primary key.
  console.log("=== getCreateSchemaSQL (note the primary key column) ===\n");
  const createSql = (await orm.schema.getCreateSchemaSQL()).trim();
  console.log(
    createSql.split("\n").find((l) => l.includes("animal")) ?? createSql,
  );

  // Build the schema, then ask for the update SQL — should be empty.
  await orm.schema.refresh();
  const updateSql = (await orm.schema.getUpdateSchemaSQL()).trim();
  console.log("\n=== schema:update against an in-sync database (expected: empty) ===\n");
  console.log(updateSql || "(empty)");

  await orm.close();
})();
