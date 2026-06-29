import { Card } from "../cards/Card";
import { CardInstance } from "../cards/CardInstance";

type DeckCardEntry = {
  cardId: string;
  count: number;
};

type RawDeckData = {
  name: string;
  cards: DeckCardEntry[];
};

export class DeckFactory {
  public static create(
    deckData: RawDeckData,
    cardMaster: Map<string, Card>
  ): CardInstance[] {
    const deck: CardInstance[] = [];
    let instanceId = 1;

    for (const entry of deckData.cards) {
      const card = cardMaster.get(entry.cardId);

      if (!card) {
        throw new Error(`Card not found: ${entry.cardId}`);
      }

      for (let i = 0; i < entry.count; i++) {
        deck.push(new CardInstance(instanceId, card));
        instanceId++;
      }
    }

    if (deck.length !== 50) {
      throw new Error(`Deck must contain exactly 50 cards. Current: ${deck.length}`);
    }

    return deck;
  }
}