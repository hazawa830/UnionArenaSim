import { CardInstance } from "../cards/CardInstance";
import { Player } from "../core/Player";
import { CardZone } from "../enum/CardZone";
import { DeckPosition } from "../enum/DeckPosition";
import { CardZoneService } from "./CardZoneService";

export type MoveCardsOptions = {
  deckPosition?: DeckPosition;
  enterRested?: boolean;
};

export class CardMovementService {
  public static moveCards(
    player: Player,
    cards: CardInstance[],
    from: CardZone,
    to: CardZone,
    options: MoveCardsOptions = {}
  ): void {
    if (from === to) {
      throw new Error(
        `同じゾーン間では移動できません: ${from}`
      );
    }

    if (cards.length === 0) {
      return;
    }

    /*
     * 1枚でも存在しないカードがあれば、
     * 移動開始前に失敗させる。
     */
    for (const card of cards) {
      if (!CardZoneService.containsCard(player, from, card)) {
        throw new Error(
          `移動元ゾーン ${from} にカードが存在しません: ${card.card.name}`
        );
      }
    }

    /*
     * 配列型ゾーンでは重複を防ぐ。
     * Slot型ゾーンは空きスロット検査をaddCards側で行う。
     */
    if (
      to !== CardZone.FrontLine &&
      to !== CardZone.EnergyLine
    ) {
      for (const card of cards) {
        if (CardZoneService.containsCard(player, to, card)) {
          throw new Error(
            `移動先ゾーン ${to} にカードが既に存在します: ${card.card.name}`
          );
        }
      }
    }

    /*
     * 盤面への追加で失敗してカードが消えないよう、
     * 取り外す前に空きスロットを確認する。
     */
    this.validateDestinationCapacity(player, cards, to);

    const removedCards = cards.map((card) =>
      CardZoneService.removeCard(player, from, card)
    );

    CardZoneService.addCards(
      player,
      to,
      removedCards,
      options
    );
  }

  public static moveCardsWithinDeck(
    player: Player,
    cards: CardInstance[],
    position: DeckPosition
  ): void {
    if (cards.length === 0) {
      return;
    }

    for (const card of cards) {
      if (
        !CardZoneService.containsCard(
          player,
          CardZone.Deck,
          card
        )
      ) {
        throw new Error(
          `山札にカードが存在しません: ${card.card.name}`
        );
      }
    }

    const removedCards = cards.map((card) =>
      CardZoneService.removeCard(
        player,
        CardZone.Deck,
        card
      )
    );

    CardZoneService.addCards(
      player,
      CardZone.Deck,
      removedCards,
      {
        deckPosition: position
      }
    );
  }

  private static validateDestinationCapacity(
    player: Player,
    cards: CardInstance[],
    to: CardZone
  ): void {
    if (to === CardZone.FrontLine) {
      const emptyCount = player.board.frontLine.filter(
        (slot) => slot.isEmpty()
      ).length;

      if (emptyCount < cards.length) {
        throw new Error(
          "フロントラインに空きスロットが足りません"
        );
      }
    }

    if (to === CardZone.EnergyLine) {
      const emptyCount = player.board.energyLine.filter(
        (slot) => slot.isEmpty()
      ).length;

      if (emptyCount < cards.length) {
        throw new Error(
          "エナジーラインに空きスロットが足りません"
        );
      }
    }
  }
}