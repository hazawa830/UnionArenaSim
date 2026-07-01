import { EffectAction } from "../EffectAction";
import { EffectContext } from "../EffectContext";

type DiscardHandAction = Extract<EffectAction, { type: "discardHand" }>;

export class DiscardHandEffectAction {
  public static execute(
    context: EffectContext,
    action: DiscardHandAction
  ): void {
    const board = context.actor.board;

    for (let i = 0; i < action.count; i++) {
      const discarded = board.hand.shift();

      if (!discarded) {
        return;
      }

      board.trash.push(discarded);
    }
  }
}