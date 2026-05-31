import { MikroORM } from "@mikro-orm/postgresql";

import config from "./mikro-orm.config.ts";

void (async () => {
  const orm = await MikroORM.init(config);
  await orm.migrator.up();
  await orm.close();
})();
