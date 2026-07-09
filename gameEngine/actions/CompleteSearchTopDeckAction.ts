import type { Game } from "../core/Game";
import type { CardInstance } from "../cards/CardInstance";

export class CompleteSearchTopDeckAction {
  static execute(
    game: Game,
    playerId: string,
    shownCards: CardInstance[],
    selectedCards: CardInstance[]
  ): {
    selectedCount: number;
    needsDiscard: boolean;
  } {
    const player =
      game.player1.id === playerId ? game.player1 : game.player2;

    for (const selected of selectedCards) {
      if (!shownCards.includes(selected)) {
        throw new Error("選択されたカードが確認対象に含まれていません");
      }
    }

    for (const selected of selectedCards) {
      player.board.hand.push(selected);
    }

    player.board.deck = player.board.deck.filter(
      (deckCard) => !shownCards.includes(deckCard)
    );

    const restCards = shownCards.filter(
      (card) => !selectedCards.includes(card)
    );

    player.board.deck.unshift(...restCards);

    return {
      selectedCount: selectedCards.length,
      needsDiscard: selectedCards.length > 0,
    };
  }
}