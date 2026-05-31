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

// Per-subtype branded id types, so references are type-safe (a DogId can't be
// passed where a CatId is expected).
type DogId = string & { readonly __brand: "DogId" };
type CatId = string & { readonly __brand: "CatId" };

let counter = 0;
const makeId = <T extends string>(prefix: string): T =>
  `${prefix}_${++counter}` as T;

@Entity({
  tableName: "animal",
  abstract: true,
  discriminatorColumn: "type",
  discriminatorMap: { dog: "Dog", cat: "Cat" },
})
export abstract class Animal {
  @PrimaryKey({ type: "string" })
  id!: string;

  @Enum({ items: () => AnimalType })
  type!: AnimalType;

  @Property({ type: "string" })
  name!: string;
}

@Entity({ discriminatorValue: "dog" })
export class Dog extends Animal {
  @PrimaryKey({ type: "string" })
  id: DogId = makeId<DogId>("dog");

  @Property({ type: "boolean", nullable: true })
  goodBoy?: boolean;
}

@Entity({ discriminatorValue: "cat" })
export class Cat extends Animal {
  @PrimaryKey({ type: "string" })
  id: CatId = makeId<CatId>("cat");

  @Property({ type: "number", nullable: true })
  lives?: number;
}
