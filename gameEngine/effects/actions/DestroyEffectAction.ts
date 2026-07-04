import { CardInstance } from "../../cards/CardInstance";
import { BoardLine } from "../../enum/BoardLine";
import { EffectLogType } from "../../enum/EffectLogType";
import { LogType } from "../../enum/LogType";
import { GameLogger } from "../../log/GameLogger";
import { EffectAction } from "../EffectAction";
import { EffectContext } from "../EffectContext";
import { EffectTargetResolver } from "../EffectTargetResolver";

type DestroyAction = Extract<EffectAction, { type: "destroy" }>;

type RemoveResult = {
  card: CardInstance;
  line: BoardLine;
};

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

    targetBoard.trash.push(removed.card);

    GameLogger.add(context.game, {
      playerId:
        action.target.side === "own"
          ? context.actor.id
          : context.opponent.id,
      type: LogType.Effect,
      message: `${removed.card.card.name}を効果で退場させた`,
      payload: {
        effectType: EffectLogType.Destroy,

        sourceInstanceId: context.source.instanceId,
        sourceCardId: context.source.card.id,
        sourceCardName: context.source.card.name,

        destroyedInstanceId: removed.card.instanceId,
        destroyedCardId: removed.card.card.id,
        destroyedCardName: removed.card.card.name,

        targetSide: action.target.side,
        targetZone: removed.line,
      },
    });
  }

  private static removeFromLine(
    board: {
      frontLine: {
        getCard(): CardInstance | undefined;
        removeCard(): CardInstance | undefined;
      }[];
      energyLine: {
        getCard(): CardInstance | undefined;
        removeCard(): CardInstance | undefined;
      }[];
    },
    line: BoardLine,
    target: CardInstance
  ): RemoveResult | undefined {
    const slots =
      line === BoardLine.FrontLine ? board.frontLine : board.energyLine;

    const slot = slots.find((slot) => slot.getCard() === target);
    const removed = slot?.removeCard();

    if (!removed) {
      return undefined;
    }

    return {
      card: removed,
      line,
    };
  }
}