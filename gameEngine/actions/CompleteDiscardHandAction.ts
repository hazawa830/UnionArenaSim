import type { Game } from "../core/Game";
import type { CardInstance } from "../cards/CardInstance";

export class CompleteDiscardHandAction {
  static execute(
    game: Game,
    playerId: string,
    discardedCards: CardInstance[]
  ): void {
    const player =
      game.player1.id === playerId ? game.player1 : game.player2;

    for (const discarded of discardedCards) {
      if (!player.board.hand.includes(discarded)) {
        throw new Error("捨てるカードが手札に存在しません");
      }
    }

    for (const discarded of discardedCards) {
      player.board.hand = player.board.hand.filter(
        (handCard) => handCard !== discarded
      );

      player.board.trash.push(discarded);
    }
  }
}