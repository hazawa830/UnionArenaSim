import { Keyword } from "./KeywordAbility";

type RawKeyword = {
  type: string;
  value?: number;
};

export class KeywordFactory {
  public static create(raw: RawKeyword): Keyword {
    switch (raw.type) {
      case "step":
        return {
          type: "step",
        };

      case "snipe":
        return {
          type: "snipe",
        };

      case "doubleAttack":
        return {
          type: "doubleAttack",
        };

      case "doubleBlock":
        return {
          type: "doubleBlock",
        };

      case "impact":
        if (raw.value === undefined) {
          throw new Error("impact keyword must have value.");
        }

        return {
          type: "impact",
          value: raw.value,
        };

      case "impactPlus":
        if (raw.value === undefined) {
          throw new Error("impactPlus keyword must have value.");
        }

        return {
          type: "impactPlus",
          value: raw.value,
        };

      case "damage":
        if (raw.value === undefined) {
          throw new Error("damage keyword must have value.");
        }

        return {
          type: "damage",
          value: raw.value,
        };

      case "damagePlus":
        if (raw.value === undefined) {
          throw new Error("damagePlus keyword must have value.");
        }

        return {
          type: "damagePlus",
          value: raw.value,
        };

      case "impactNullify":
        return {
          type: "impactNullify",
        };

      default:
        throw new Error(`Unknown keyword type: ${raw.type}`);
    }
  }

  public static createMany(rawKeywords?: RawKeyword[]): Keyword[] {
    return (rawKeywords ?? []).map((raw) => this.create(raw));
  }
}