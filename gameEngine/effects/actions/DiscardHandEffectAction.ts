import { CardZone } from "../../enum/CardZone";
import { CardMovementService } from "../../service/CardMovementService";
import { EffectAction } from "../EffectAction";
import { EffectContext } from "../EffectContext";

type DiscardHandAction = Extract<EffectAction, { type: "discardHand" }>;

export class DiscardHandEffectAction {
  public static execute(
    context: EffectContext,
    action: DiscardHandAction
  ): void {
    const actor = context.actor;

    const discardCount = Math.min(
      action.count,
      actor.board.hand.length
    );

    if (discardCount === 0) {
      return;
    }

    const discardedCards = actor.board.hand.slice(0, discardCount);

    CardMovementService.moveCards(
      actor,
      discardedCards,
      CardZone.Hand,
      CardZone.Trash
    );
  }
}