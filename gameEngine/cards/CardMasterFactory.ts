import { Card } from "./Card";
import { CardFactory } from "./CardFactory";

export class CardMasterFactory {
  public static create(rawCards: unknown[]): Map<string, Card> {
    const cardMaster = new Map<string, Card>();

    for (const raw of rawCards) {
      const card = CardFactory.create(raw as any);

      if (cardMaster.has(card.id)) {
        throw new Error(`Duplicate card id: ${card.id}`);
      }

      cardMaster.set(card.id, card);
    }

    return cardMaster;
  }
}