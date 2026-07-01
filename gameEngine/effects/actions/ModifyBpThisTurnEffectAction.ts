import { CardInstance } from "../../cards/CardInstance";
import { EffectAction } from "../EffectAction";
import { EffectTargetResolver } from "../EffectTargetResolver";
import { EffectContext } from "../EffectContext";

type ModifyBpThisTurnAction = Extract<
  EffectAction,
  { type: "modifyBpThisTurn" }
>;

export class ModifyBpThisTurnEffectAction {
  public static execute(
    context: EffectContext,
    action: ModifyBpThisTurnAction
  ): void {
    if (typeof action.target === "string") {
      this.executeStringTarget(context, action);
      return;
    }

    const candidates = EffectTargetResolver.resolveCandidates(
      context,
      action.target
    );

    const target = candidates[0];

    if (!target) {
      return;
    }

    target.temporaryBpBonus += action.amount;
  }

  private static executeStringTarget(
    context: EffectContext,
    action: ModifyBpThisTurnAction
  ): void {
    switch (action.target) {
      case "self":
        context.source.temporaryBpBonus += action.amount;
        return;

      case "selectedOwnOtherCharacter": {
        const target = context.event?.target;

        if (!target) {
          throw new Error("Target card not found.");
        }

        if (target === context.source) {
          throw new Error("Cannot target self.");
        }

        target.temporaryBpBonus += action.amount;
        return;
      }

      default:
        throw new Error(
          `Unsupported modifyBpThisTurn target: ${action.target}`
        );
    }
  }
}