import { CardInstance } from "../cards/CardInstance";
import { EffectContext } from "./EffectContext";
import { EffectTrigger } from "./EffectTrigger";
import { EffectConditionResolver } from "./EffectConditionResolver";
import { Effect } from "./Effect";

export class ContinuousEffectResolver {
  public static getBpBonus(context: EffectContext): number {
    let bonus = 0;

    const effects = this.getContinuousEffects(context);

    for (const effect of effects) {
      if (!EffectConditionResolver.checkConditions(context, effect.conditions)) {
        continue;
      }

      for (const action of effect.actions) {
        if (action.type !== "modifyBpContinuous") {
          continue;
        }

        if (action.target !== "self") {
          throw new Error(
            `Unsupported modifyBpContinuous target: `
          );
        }

        bonus += action.amount;
      }
    }

    return bonus;
  }

  public static getCurrentBp(
    context: EffectContext,
    cardInstance: CardInstance
  ): number {
    return cardInstance.getCurrentBp() + this.getBpBonus(context);
  }

  private static getContinuousEffects(context: EffectContext): Effect[] {
    return [
      ...context.source.card.effects,
      ...(context.source.isRaid() ? context.source.card.raidEffects : []),
    ].filter(
      (effect) =>
        effect.trigger === EffectTrigger.DuringOwnTurn ||
        effect.trigger === EffectTrigger.Continuous
    );
  }
}