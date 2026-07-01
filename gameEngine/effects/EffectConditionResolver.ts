import { EffectCondition } from "./EffectCondition";
import { EffectContext } from "./EffectContext";

export class EffectConditionResolver {
  public static checkConditions(
    context: EffectContext,
    conditions?: EffectCondition[]
  ): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    return conditions.every((condition) =>
      this.checkCondition(context, condition)
    );
  }

  private static checkCondition(
    context: EffectContext,
    condition: EffectCondition
  ): boolean {
    switch (condition.type) {
      case "hasCharacterNamesOnField": {
        const board = context.actor.board;

        const fieldNames = [...board.frontLine, ...board.energyLine]
          .map((slot) => slot.getCard()?.card.name)
          .filter((name): name is string => name !== undefined);

        return condition.mode === "all"
          ? condition.names.every((name) => fieldNames.includes(name))
          : condition.names.some((name) => fieldNames.includes(name));
      }

      case "hasCharacterNamesOnFrontLine": {
        const names = context.actor.board.frontLine
          .map((slot) => slot.getCard()?.card.name)
          .filter((name): name is string => name !== undefined);

        return condition.mode === "all"
          ? condition.names.every((name) => names.includes(name))
          : condition.names.some((name) => names.includes(name));
      }

      case "isOnLine": {
        const board = context.actor.board;

        const line =
          condition.line === "frontLine"
            ? board.frontLine
            : board.energyLine;

        return line.some((slot) => slot.getCard() === context.source);
      }

      case "attackerNameIs": {
        const attacker = context.event?.attacker;

        if (!attacker) {
          return false;
        }

        return condition.names.includes(attacker.card.name);
      }
      case "attackerIsSelf": {
        const attacker = context.event?.attacker;

        if (!attacker) {
            return false;
        }

        return attacker === context.source;
      }
      default:
        throw new Error(`Unknown effect condition: ${(condition as any).type}`);
    }
  }
}