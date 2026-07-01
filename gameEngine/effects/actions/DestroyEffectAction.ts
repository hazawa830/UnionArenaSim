import { Game } from "../../core/Game";
import { CardInstance } from "../../cards/CardInstance";
import { EffectAction } from "../EffectAction";
import { EffectTargetResolver } from "../EffectTargetResolver";
import { EffectTarget } from "../EffectTarget";
import { BoardLine } from "../../enum/BoardLine";
import { EffectContext } from "../EffectContext";
type DestroyAction = Extract<EffectAction, { type: "destroy" }>;

export class DestroyEffectAction {
  public static execute(
    context: EffectContext,
    action: DestroyAction
): void {
    const candidates = EffectTargetResolver.resolveCandidates(
    context,
    action.target
);

    const target = candidates[0];

    if (!target) {
      return;
    }

    const targetBoard =
    action.target.side === "own"
        ? context.actor.board
        : context.opponent.board;

    const removed =
      this.removeFromLine(targetBoard, BoardLine.FrontLine, target) ??
      this.removeFromLine(targetBoard, BoardLine.EnergyLine, target);

    if (!removed) {
      return;
    }

    targetBoard.trash.push(removed);
  }

  private static removeFromLine(
    board: {
      frontLine: { getCard(): CardInstance | undefined; removeCard(): CardInstance | undefined }[];
      energyLine: { getCard(): CardInstance | undefined; removeCard(): CardInstance | undefined }[];
    },
    line: BoardLine,
    target: CardInstance
  ): CardInstance | undefined {
    const slots =
      line === BoardLine.FrontLine ? board.frontLine : board.energyLine;

    const slot = slots.find((slot) => slot.getCard() === target);

    return slot?.removeCard();
  }
}