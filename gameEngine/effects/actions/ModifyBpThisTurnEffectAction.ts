import { Game } from "../../core/Game";
import { CardInstance } from "../../cards/CardInstance";
import { EffectAction } from "../EffectAction";
import { EffectTargetResolver } from "../EffectTargetResolver";

type ModifyBpThisTurnAction = Extract<
  EffectAction,
  { type: "modifyBpThisTurn" }
>;

export class ModifyBpThisTurnEffectAction {
  public static execute(
    game: Game,
    source: CardInstance,
    action: ModifyBpThisTurnAction
  ): void {
    if (typeof action.target === "string") {
      this.executeStringTarget(source, action);
      return;
    }

    const candidates = EffectTargetResolver.resolveCandidates(
      game,
      source,
      action.target
    );

    const target = candidates[0];

    if (!target) {
      return;
    }

    target.temporaryBpBonus += action.amount;
  }

  private static executeStringTarget(
    source: CardInstance,
    action: ModifyBpThisTurnAction
  ): void {
    switch (action.target) {
      case "self":
        source.temporaryBpBonus += action.amount;
        return;

      default:
        throw new Error(
          `Unsupported modifyBpThisTurn target: ${action.target}`
        );
    }
  }
}