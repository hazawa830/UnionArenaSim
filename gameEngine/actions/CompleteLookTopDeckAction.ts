import { CardInstance } from "../cards/CardInstance";
import { Game } from "../core/Game";
import { Player } from "../core/Player";
import { CardZone } from "../enum/CardZone";
import { DeckPosition } from "../enum/DeckPosition";
import {
  EffectAction,
  LookTopDeckAction
} from "../effects/EffectAction";
import { CardMovementService } from "../service/CardMovementService";

export type LookTopDeckSelectionResult = {
  selectionId: string;
  selectedCards: CardInstance[];
};

export type CompleteLookTopDeckResult = {
  selectedCount: number;
  followUpActions: EffectAction[];
};

export class CompleteLookTopDeckAction {
  public static execute(
    game: Game,
    playerId: string,
    action: LookTopDeckAction,
    revealedCards: CardInstance[],
    selectionResults: LookTopDeckSelectionResult[],
    orderedRemainingCards?: CardInstance[]
  ): CompleteLookTopDeckResult {
    const player = this.getPlayer(game, playerId);

    this.validateRevealedCards(player, action, revealedCards);
    this.validateSelections(
      action,
      revealedCards,
      selectionResults
    );

    const selectedCards = selectionResults.flatMap(
      (result) => result.selectedCards
    );

    for (const selectionResult of selectionResults) {
      const selection = action.selections.find(
        (item) => item.id === selectionResult.selectionId
      );

      if (!selection) {
        throw new Error(
          `存在しない選択IDです: ${selectionResult.selectionId}`
        );
      }

      if (selectionResult.selectedCards.length === 0) {
        continue;
      }

      CardMovementService.moveCards(
        player,
        selectionResult.selectedCards,
        CardZone.Deck,
        selection.destination,
        {
          deckPosition: selection.deckPosition
        }
      );
    }

    const remainingCards = revealedCards.filter(
      (card) => !selectedCards.includes(card)
    );

    const orderedRest =
      orderedRemainingCards ?? remainingCards;

    this.validateRemainingOrder(
      remainingCards,
      orderedRest
    );

    this.moveRemainingCards(
      player,
      action,
      orderedRest
    );

    return {
      selectedCount: selectedCards.length,
      followUpActions:
        selectedCards.length > 0
          ? action.ifSelected ?? []
          : []
    };
  }

  private static getPlayer(
    game: Game,
    playerId: string
  ): Player {
    if (game.player1.id === playerId) {
      return game.player1;
    }

    if (game.player2.id === playerId) {
      return game.player2;
    }

    throw new Error(
      `プレイヤーが見つかりません: ${playerId}`
    );
  }

  private static validateRevealedCards(
    player: Player,
    action: LookTopDeckAction,
    revealedCards: CardInstance[]
  ): void {
    const expectedCards = player.board.deck.slice(
      0,
      action.lookCount
    );

    if (
      expectedCards.length !== revealedCards.length ||
      expectedCards.some(
        (card, index) => card !== revealedCards[index]
      )
    ) {
      throw new Error(
        "公開カードが現在の山札上と一致しません"
      );
    }
  }

  private static validateSelections(
    action: LookTopDeckAction,
    revealedCards: CardInstance[],
    results: LookTopDeckSelectionResult[]
  ): void {
    const allSelected = results.flatMap(
      (result) => result.selectedCards
    );

    if (new Set(allSelected).size !== allSelected.length) {
      throw new Error(
        "同じカードが複数の選択先に指定されています"
      );
    }

    for (const result of results) {
      const selection = action.selections.find(
        (item) => item.id === result.selectionId
      );

      if (!selection) {
        throw new Error(
          `存在しない選択IDです: ${result.selectionId}`
        );
      }

      if (
        result.selectedCards.length < selection.minCount ||
        result.selectedCards.length > selection.maxCount
      ) {
        throw new Error(
          `選択枚数が範囲外です: ${result.selectionId}`
        );
      }

      for (const card of result.selectedCards) {
        if (!revealedCards.includes(card)) {
          throw new Error(
            "公開されていないカードが選択されています"
          );
        }
      }
    }
  }

  private static validateRemainingOrder(
    remainingCards: CardInstance[],
    orderedCards: CardInstance[]
  ): void {
    if (
      remainingCards.length !== orderedCards.length ||
      remainingCards.some(
        (card) => !orderedCards.includes(card)
      )
    ) {
      throw new Error(
        "残りカードの内容が一致しません"
      );
    }
  }

  private static moveRemainingCards(
    player: Player,
    action: LookTopDeckAction,
    cards: CardInstance[]
  ): void {
    if (cards.length === 0) {
      return;
    }

    if (action.restDestination === CardZone.Deck) {
      CardMovementService.moveCardsWithinDeck(
        player,
        cards,
        action.restDeckPosition ?? DeckPosition.Bottom
      );

      return;
    }

    CardMovementService.moveCards(
      player,
      cards,
      CardZone.Deck,
      action.restDestination,
      {
        deckPosition: action.restDeckPosition
      }
    );
  }
}