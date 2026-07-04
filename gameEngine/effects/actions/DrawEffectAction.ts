import { EffectAction } from "../EffectAction";
import { EffectContext } from "../EffectContext";
import { GameLogger } from "../../log/GameLogger";
import { LogType } from "../../enum/LogType";

type DrawAction = Extract<EffectAction, { type: "draw" }>;

export class DrawEffectAction {
  public static execute(
    context: EffectContext,
    action: DrawAction
  ): void {
    context.actor.board.draw(action.count);

    GameLogger.add(context.game, {
      playerId: context.actor.id,
      type: LogType.Effect,
      message: `${action.count}枚ドロー`,
      payload: {
        effectType: "draw",
        sourceInstanceId: context.source.instanceId,
        sourceCardId: context.source.card.id,
        sourceCardName: context.source.card.name,
        drawCount: action.count,
      },
    });
  }
}