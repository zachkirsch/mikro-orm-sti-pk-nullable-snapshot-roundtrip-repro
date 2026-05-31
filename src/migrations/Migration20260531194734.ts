import { Migration } from '@mikro-orm/migrations';

export class Migration20260531194734 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "animal" ("id" serial primary key, "type" text not null, "name" varchar(255) not null, "good_boy" boolean null, "lives" int null);`);
    this.addSql(`create index "animal_type_index" on "animal" ("type");`);

    this.addSql(`alter table "animal" add constraint "animal_type_check" check ("type" in ('dog', 'cat'));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "animal" cascade;`);
  }

}
