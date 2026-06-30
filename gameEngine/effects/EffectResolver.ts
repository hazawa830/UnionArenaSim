import { Game } from "../core/Game";
import { CardInstance } from "../cards/CardInstance";
import { EffectTrigger } from "./EffectTrigger";
import { Effect } from "./Effect";
import { EffectCondition } from "./EffectCondition";
import { EffectAction } from "./EffectAction";
import { EffectActionExecutor } from "./EffectActionExecutor";
export class EffectResolver {
  public static resolve(
    game: Game,
    source: CardInstance,
    trigger: EffectTrigger
  ): void {
    const effects = source.card.effects.filter(
      (effect) => effect.trigger === trigger
    );

    for (const effect of effects) {
      if (!this.checkConditions(game, source, effect)) {
        continue;
      }

      this.executeActions(game, source, effect);
    }
  }

  private static checkConditions(
    game: Game,
    source: CardInstance,
    effect: Effect
  ): boolean {
    if (!effect.conditions || effect.conditions.length === 0) {
      return true;
    }

    return effect.conditions.every((condition) =>
      this.checkCondition(game, source, condition)
    );
  }

  private static checkCondition(
    game: Game,
    source: CardInstance,
    condition: EffectCondition
  ): boolean {
    switch (condition.type) {
      case "hasCharacterNamesOnField": {
        const board = game.getCurrentPlayer().board;

        const fieldNames = [...board.frontLine, ...board.energyLine]
          .map((slot) => slot.getCard()?.card.name)
          .filter((name): name is string => name !== undefined);

        if (condition.mode === "all") {
          return condition.names.every((name) => fieldNames.includes(name));
        }

        return condition.names.some((name) => fieldNames.includes(name));
      }
      case "isOnLine": {
        const board = game.getCurrentPlayer().board;

        const line =
            condition.line === "frontLine"
            ? board.frontLine
            : board.energyLine;

        return line.some((slot) => slot.getCard() === source);
      }

      default:
        throw new Error(`Unknown effect condition: ${(condition as any).type}`);
    }
  }

  private static executeActions(
    game: Game,
    source: CardInstance,
    effect: Effect
    ): void {
    for (const action of effect.actions) {
        EffectActionExecutor.execute(game, source, action);
    }
  }

  
}