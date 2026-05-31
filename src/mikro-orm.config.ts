import { Migrator } from "@mikro-orm/migrations";
import { defineConfig } from "@mikro-orm/postgresql";

import { Animal, Cat, Dog } from "./entity.ts";

export default defineConfig({
  dbName: "postgres",
  host: "localhost",
  port: 1002,
  user: "postgres",
  password: "password",
  entities: [Animal, Dog, Cat],
  extensions: [Migrator],
  migrations: {
    path: "src/migrations",
    snapshot: true,
    snapshotName: ".snapshot-postgres",
  },
});
