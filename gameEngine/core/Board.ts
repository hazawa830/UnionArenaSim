import { CardInstance } from "../cards/CardInstance";
import { Slot } from "../models/Slot";
import { Energy } from "../models/Energy";
import { StageCard } from "../cards/StageCard";
import { CharacterCard } from "../cards/CharacterCard.ts";

export class Board {
  public readonly frontLine: Slot[];
  public readonly energyLine: Slot[];

  public  hand: CardInstance[];
  public  deck: CardInstance[];
  public readonly lifeArea: CardInstance[];
  public readonly actionPoints: CardInstance[];
  public readonly trash: CardInstance[];
  public readonly removeArea: CardInstance[];
  public maxActionPoint: number;
  public activeActionPoint: number;
  public hasUsedExtraDrawThisTurn: boolean;

  constructor(deck: CardInstance[] = []) {
    this.frontLine = [
      new Slot(),
      new Slot(),
      new Slot(),
      new Slot(),
    ];

    this.energyLine = [
      new Slot(),
      new Slot(),
      new Slot(),
      new Slot(),
    ];

    this.deck = deck;
    this.hand = [];
    this.lifeArea = [];
    this.actionPoints = [];
    this.trash = [];
    this.removeArea = [];
    this.maxActionPoint = 0;
    this.activeActionPoint = 0;
    this.hasUsedExtraDrawThisTurn = false;
  }

  public draw(count: number = 1): CardInstance[] {

    const cards: CardInstance[] = [];

    for (let i = 0; i < count; i++) {

        const card = this.deck.shift();

        if (!card) {
            break;
        }

        this.hand.push(card);

        cards.push(card);

    }

    return cards;

}

  public addToLifeFromDeck(count: number): void {
    for (let i = 0; i < count; i++) {
      const card = this.deck.shift();

      if (!card) {
        throw new Error("Deck is empty. Cannot add card to life area.");
      }

      this.lifeArea.push(card);
    }
  }

  public addActionPointFromDeck(count: number): void {
    for (let i = 0; i < count; i++) {
      const card = this.deck.shift();

      if (!card) {
        throw new Error("Deck is empty. Cannot add card to action point area.");
      }

      this.actionPoints.push(card);
    }
  }

  public getEmptyFrontSlot(): Slot | undefined {
    return this.frontLine.find((slot) => slot.isEmpty());
  }

  public getEmptyEnergySlot(): Slot | undefined {
    return this.energyLine.find((slot) => slot.isEmpty());
  }
  public setActionPoint(max: number): void {
    this.maxActionPoint = max;
    this.activeActionPoint = max;
  }

  public payActionPoint(cost: number): void {
    if (this.activeActionPoint < cost) {
        throw new Error("Not enough action points.");
    }

    this.activeActionPoint -= cost;}
  
  public getGeneratedEnergy(): Energy {
    const total = new Energy();

    for (const slot of this.energyLine) {
        const cardInstance = slot.getCard();

        if (!cardInstance) {
        continue;
        }

        const card = cardInstance.card;

        if (card instanceof CharacterCard || card instanceof StageCard) {
        total.add(card.generatedEnergy);
        }
    }

    return total;
}
public activateAllCards(): void {
  for (const slot of [...this.frontLine, ...this.energyLine]) {
    const card = slot.getCard();

    if (card) {
      card.isRest = false;
    }
  }
}
public clearTemporaryBpBonus(): void {
  for (const slot of [...this.frontLine, ...this.energyLine]) {
    const card = slot.getCard();

    if (card) {
      card.temporaryBpBonus = 0;
    }
  }
}
public usedCardNameEffectIdsThisTurn = new Set<string>();
public clearUsedEffectIdsThisTurn(): void {
  this.clearTurnState();
}
public clearTurnState(): void {
  this.hasUsedExtraDrawThisTurn = false;
  this.usedCardNameEffectIdsThisTurn.clear();

  for (const slot of [...this.frontLine, ...this.energyLine]) {
    const card = slot.getCard();

    if (!card) {
      continue;
    }

    card.usedEffectIdsThisTurn.clear();
    card.attackedThisTurnCount = 0;
    card.blockedThisTurnCount = 0;
  }
}
}