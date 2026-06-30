import { Game } from "../../core/Game";
import { CardInstance } from "../../cards/CardInstance";
import { EffectAction } from "../EffectAction";

type ActivateAction = Extract<EffectAction, { type: "activate" }>;

export class ActivateEffectAction {
  public static execute(
    game: Game,
    source: CardInstance,
    action: ActivateAction
  ): void {
    if (typeof action.target === "string") {
      this.executeStringTarget(source, action);
      return;
    }

    if (action.target.zone === "ap") {
      const board =
        action.target.side === "own"
          ? game.getCurrentPlayer().board
          : game.getOpponentPlayer().board;

      const count = action.target.maxCount ?? action.count ?? 1;

      board.setActionPoint(
        Math.min(board.maxActionPoint, board.activeActionPoint + count)
      );

      return;
    }

    throw new Error(`Unsupported activate target zone: ${action.target.zone}`);
  }

  private static executeStringTarget(
    source: CardInstance,
    action: ActivateAction
  ): void {
    switch (action.target) {
      case "self":
        source.isRest = false;
        return;

      default:
        throw new Error(`Unsupported activate target: ${action.target}`);
    }
  }
}