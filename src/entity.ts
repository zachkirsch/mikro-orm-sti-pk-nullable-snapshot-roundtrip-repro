import {
  Entity,
  Enum,
  PrimaryKey,
  Property,
} from "@mikro-orm/decorators/legacy";

export enum AnimalType {
  DOG = "dog",
  CAT = "cat",
}

@Entity({
  tableName: "animal",
  abstract: true,
  discriminatorColumn: "type",
  discriminatorMap: { dog: "Dog", cat: "Cat" },
})
export abstract class Animal {
  @PrimaryKey({ type: "number" })
  id!: number;

  @Enum({ items: () => AnimalType })
  type!: AnimalType;

  @Property({ type: "string" })
  name!: string;
}

@Entity({ discriminatorValue: "dog" })
export class Dog extends Animal {
  // Re-declaring the inherited primary key in an STI child is what makes the
  // root PK get serialized as `nullable: true`.
  @PrimaryKey({ type: "number" })
  id!: number;

  @Property({ type: "boolean", nullable: true })
  goodBoy?: boolean;
}

@Entity({ discriminatorValue: "cat" })
export class Cat extends Animal {
  @PrimaryKey({ type: "number" })
  id!: number;

  @Property({ type: "number", nullable: true })
  lives?: number;
}
