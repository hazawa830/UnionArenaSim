import { CardInstance } from "../cards/CardInstance";
import { Player } from "../core/Player";
import { CardZone } from "../enum/CardZone";
import { DeckPosition } from "../enum/DeckPosition";

export type MoveCardsOptions = {
  deckPosition?: DeckPosition;
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

    const source = this.getMutableZone(player, from);
    const destination = this.getMutableZone(player, to);

    // 途中まで移動してから失敗しないよう、
    // 先に全カードが移動元に存在することを確認する
    for (const card of cards) {
      if (!source.includes(card)) {
        throw new Error(
          `移動元ゾーン ${from} にカードが存在しません: ${card.card.name}`
        );
      }
    }

    // 同じCardInstanceが二重に入るのを防ぐ
    for (const card of cards) {
      if (destination.includes(card)) {
        throw new Error(
          `移動先ゾーン ${to} にカードが既に存在します: ${card.card.name}`
        );
      }
    }

    // 移動元から削除
    for (const card of cards) {
      const index = source.indexOf(card);

      if (index === -1) {
        throw new Error(
          `移動元ゾーン ${from} からカードを削除できませんでした`
        );
      }

      source.splice(index, 1);
    }

    // 移動先へ追加
    if (to === CardZone.Deck) {
      const deckPosition =
        options.deckPosition ?? DeckPosition.Bottom;

      if (deckPosition === DeckPosition.Top) {
        destination.unshift(...cards);
        return;
      }

      destination.push(...cards);
      return;
    }

    destination.push(...cards);
  }
  public static moveCardsWithinDeck(
  player: Player,
  cards: CardInstance[],
  position: DeckPosition
): void {
  if (cards.length === 0) {
    return;
  }

  const deck = player.board.deck;

  for (const card of cards) {
    if (!deck.includes(card)) {
      throw new Error(
        `山札にカードが存在しません: ${card.card.name}`
      );
    }
  }

  for (const card of cards) {
    const index = deck.indexOf(card);

    if (index === -1) {
      throw new Error(
        `山札からカードを取り除けませんでした: ${card.card.name}`
      );
    }

    deck.splice(index, 1);
  }

  if (position === DeckPosition.Top) {
    deck.unshift(...cards);
    return;
  }

  deck.push(...cards);
}
  private static getMutableZone(
    player: Player,
    zone: CardZone
  ): CardInstance[] {
    switch (zone) {
      case CardZone.Hand:
        return player.board.hand;

      case CardZone.Deck:
        return player.board.deck;

      case CardZone.Trash:
        return player.board.trash;

      case CardZone.Life:
        return player.board.lifeArea;

      case CardZone.Remove:
        return player.board.removeArea;

      case CardZone.FrontLine:
      case CardZone.EnergyLine:
        throw new Error(
          `${zone} はSlot型ゾーンのため、現在のCardMovementServiceでは未対応です`
        );

      default: {
        const exhaustiveCheck: never = zone;

        throw new Error(
          `未対応のカードゾーンです: ${exhaustiveCheck}`
        );
      }
    }
  }
}