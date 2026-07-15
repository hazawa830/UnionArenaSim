import { CardInstance } from "../cards/CardInstance";
import { Player } from "../core/Player";
import { CardZone } from "../enum/CardZone";
import { DeckPosition } from "../enum/DeckPosition";

export type AddCardsToZoneOptions = {
  deckPosition?: DeckPosition;
  enterRested?: boolean;
};

export class CardZoneService {
  public static getCards(
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

      case CardZone.Remove:
        return player.board.removeArea;

      case CardZone.Life:
        return player.board.lifeArea;

      case CardZone.FrontLine:
        return player.board.frontLine
          .map((slot) => slot.getCard())
          .filter(
            (card): card is CardInstance =>
              card !== undefined
          );

      case CardZone.EnergyLine:
        return player.board.energyLine
          .map((slot) => slot.getCard())
          .filter(
            (card): card is CardInstance =>
              card !== undefined
          );
    }
  }
  public static findCardZone(
    player: Player,
    card: CardInstance,
    searchZones: CardZone[]
    ): CardZone | undefined {
    return searchZones.find((zone) =>
        this.containsCard(player, zone, card)
    );
    }
  public static containsCard(
    player: Player,
    zone: CardZone,
    card: CardInstance
  ): boolean {
    return this.getCards(player, zone).includes(card);
  }

  public static removeCard(
    player: Player,
    zone: CardZone,
    card: CardInstance
  ): CardInstance {
    switch (zone) {
      case CardZone.FrontLine:
        return this.removeCardFromSlots(
          player.board.frontLine,
          card,
          zone
        );

      case CardZone.EnergyLine:
        return this.removeCardFromSlots(
          player.board.energyLine,
          card,
          zone
        );

      case CardZone.Hand:
      case CardZone.Deck:
      case CardZone.Trash:
      case CardZone.Remove:
      case CardZone.Life:
        return this.removeCardFromArray(
          this.getMutableArrayZone(player, zone),
          card,
          zone
        );
    }
  }

  public static addCards(
    player: Player,
    zone: CardZone,
    cards: CardInstance[],
    options: AddCardsToZoneOptions = {}
  ): void {
    if (cards.length === 0) {
      return;
    }

    switch (zone) {
      case CardZone.Hand:
      case CardZone.Trash:
      case CardZone.Remove:
      case CardZone.Life:
        this.getMutableArrayZone(player, zone).push(...cards);
        return;

      case CardZone.Deck: {
        const deckPosition =
          options.deckPosition ?? DeckPosition.Bottom;

        if (deckPosition === DeckPosition.Top) {
          player.board.deck.unshift(...cards);
        } else {
          player.board.deck.push(...cards);
        }

        return;
      }

      case CardZone.FrontLine:
        this.addCardsToSlots(
          player.board.frontLine,
          cards,
          options.enterRested ?? false,
          zone
        );
        return;

      case CardZone.EnergyLine:
        this.addCardsToSlots(
          player.board.energyLine,
          cards,
          options.enterRested ?? false,
          zone
        );
        return;
    }
  }

  private static getMutableArrayZone(
    player: Player,
    zone:
      | CardZone.Hand
      | CardZone.Deck
      | CardZone.Trash
      | CardZone.Remove
      | CardZone.Life
  ): CardInstance[] {
    switch (zone) {
      case CardZone.Hand:
        return player.board.hand;

      case CardZone.Deck:
        return player.board.deck;

      case CardZone.Trash:
        return player.board.trash;

      case CardZone.Remove:
        return player.board.removeArea;

      case CardZone.Life:
        return player.board.lifeArea;
    }
  }

  private static removeCardFromArray(
    cards: CardInstance[],
    target: CardInstance,
    zone: CardZone
  ): CardInstance {
    const index = cards.indexOf(target);

    if (index === -1) {
      throw new Error(
        `ゾーン ${zone} にカードが存在しません: ${target.card.name}`
      );
    }

    const [removed] = cards.splice(index, 1);

    return removed;
  }

  private static removeCardFromSlots(
    slots: Array<{
      getCard(): CardInstance | undefined;
      removeCard(): CardInstance | undefined;
    }>,
    target: CardInstance,
    zone: CardZone
  ): CardInstance {
    const slot = slots.find(
      (currentSlot) => currentSlot.getCard() === target
    );

    if (!slot) {
      throw new Error(
        `ゾーン ${zone} にカードが存在しません: ${target.card.name}`
      );
    }

    const removed = slot.removeCard();

    if (!removed) {
      throw new Error(
        `ゾーン ${zone} からカードを取り外せませんでした: ${target.card.name}`
      );
    }

    return removed;
  }

  private static addCardsToSlots(
    slots: Array<{
      isEmpty(): boolean;
      setCard(card: CardInstance): void;
    }>,
    cards: CardInstance[],
    enterRested: boolean,
    zone: CardZone
  ): void {
    const emptySlots = slots.filter((slot) => slot.isEmpty());

    if (emptySlots.length < cards.length) {
      throw new Error(
        `ゾーン ${zone} に空きスロットが足りません`
      );
    }

    cards.forEach((card, index) => {
      card.isRest = enterRested;
      emptySlots[index].setCard(card);
    });
  }
}