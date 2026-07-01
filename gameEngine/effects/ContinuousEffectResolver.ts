import { CardInstance } from "../cards/CardInstance";
import { EffectContext } from "./EffectContext";
import { EffectTrigger } from "./EffectTrigger";
import { EffectConditionResolver } from "./EffectConditionResolver";

export class ContinuousEffectResolver {
  public static getBpBonus(context: EffectContext): number {
    let bonus = 0;

    const effects = context.source.card.effects.filter(
      (effect) => effect.trigger === EffectTrigger.DuringOwnTurn
    );

    for (const effect of effects) {
      if (!EffectConditionResolver.checkConditions(context, effect.conditions)) {
        continue;
      }

      for (const action of effect.actions) {
        if (action.type !== "modifyBpContinuous") {
          continue;
        }

        const target = action.target;

        if (target !== "self") {
            throw new Error(`Unsupported modifyBpContinuous target: ${target}`);
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
}