import { EffectAction } from "../EffectAction";
import { EffectContext } from "../EffectContext";

type DrawAction = Extract<EffectAction, { type: "draw" }>;

export class DrawEffectAction {
  public static execute(
    context: EffectContext,
    action: DrawAction
  ): void {
    context.actor.board.draw(action.count);
  }
}