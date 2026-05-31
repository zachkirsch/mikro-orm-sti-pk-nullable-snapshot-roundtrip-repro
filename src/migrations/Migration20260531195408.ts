import { Migration } from '@mikro-orm/migrations';

export class Migration20260531195408 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "animal" ("id" varchar(255) null, "type" text not null, "name" varchar(255) not null, "good_boy" boolean null, "lives" int null, primary key ("id"));`);
    this.addSql(`create index "animal_type_index" on "animal" ("type");`);

    this.addSql(`alter table "animal" add constraint "animal_type_check" check ("type" in ('dog', 'cat'));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "animal" cascade;`);
  }

}
