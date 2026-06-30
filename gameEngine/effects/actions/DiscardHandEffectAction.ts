import { Game } from "../../core/Game";
import { CardInstance } from "../../cards/CardInstance";
import { EffectAction } from "../EffectAction";

type DiscardHandAction = Extract<EffectAction, { type: "discardHand" }>;

export class DiscardHandEffectAction {
  public static execute(
    game: Game,
    _source: CardInstance,
    action: DiscardHandAction
  ): void {
    const player = game.getCurrentPlayer();
    const board = player.board;

    for (let i = 0; i < action.count; i++) {
      const discarded = board.hand.shift();

      if (!discarded) {
        return;
      }

      board.trash.push(discarded);
    }
  }
}