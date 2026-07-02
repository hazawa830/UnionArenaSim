// gameEngine/raid/RaidConditionResolver.ts
import { CardInstance } from "../cards/CardInstance";
import { RaidCondition } from "./RaidCondition";

export class RaidConditionResolver {
  public static canRaidOn(
    raidConditions: RaidCondition[],
    base: CardInstance
  ): boolean {
    if (raidConditions.length === 0) {
      return false;
    }

    return raidConditions.every((condition) =>
      this.checkCondition(condition, base)
    );
  }

  private static checkCondition(
    condition: RaidCondition,
    base: CardInstance
  ): boolean {
    switch (condition.type) {
      case "cardName":
        return condition.names.includes(base.card.name);

      default:
        throw new Error(`Unknown raid condition: ${(condition as any).type}`);
    }
  }
}