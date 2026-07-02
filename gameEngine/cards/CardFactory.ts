import { Energy } from "../models/Energy";
import { Card } from "./Card";
import { CardType } from "../enum/CardType";
import { CharacterCard } from "./CharacterCard";
import { StageCard } from "./StageCard";
import { EventCard } from "./EventCard";
import { TriggerType } from "../enum/TriggerType";
import { Effect } from "../effects/Effect";
import { KeywordFactory } from "./keywords/KeywordFactory";
import { RaidCondition } from "../raid/RaidCondition";

type RawEnergy = Partial<{
  red: number;
  blue: number;
  green: number;
  yellow: number;
  purple: number;
}>;

type RawCardData = {
  id: string;
  name: string;
  imagePath?: string;
  cardType: string; // ← CardType ではなく string にする
  requiredEnergy: RawEnergy;
  actionPointCost: number;
  effects?: Effect[];
  triggerType?: string;
  color?: string;
  bp?: number;
  generatedEnergy?: RawEnergy;
  keywords?: {type: string;value?: number;}[];
  raidConditions?: RaidCondition[];
  raidEffects?: Effect[];
  raidKeywords?: {type: string;value?: number;}[];
};

export class CardFactory {
  public static create(raw: RawCardData): Card {
    const cardType = raw.cardType as CardType;
    const commonData = {
  id: raw.id,
  name: raw.name,
  imagePath: raw.imagePath,
  cardType,
  requiredEnergy: new Energy(raw.requiredEnergy),
  actionPointCost: raw.actionPointCost,
  effects: raw.effects ?? [],
  triggerType: (raw.triggerType ?? TriggerType.None) as TriggerType,
  color: raw.color,
  keywords: KeywordFactory.createMany(raw.keywords),

  raidConditions: raw.raidConditions ?? [],
  raidEffects: raw.raidEffects ?? [],
  raidKeywords: KeywordFactory.createMany(raw.raidKeywords),
};
    
    switch (cardType) {
      case CardType.Character:
        if (raw.bp === undefined) {
          throw new Error(`Character card ${raw.id} must have bp.`);
        }

        if (raw.generatedEnergy === undefined) {
          throw new Error(`Character card ${raw.id} must have generatedEnergy.`);
        }

        return new CharacterCard({
          ...commonData,
          bp: raw.bp,
          generatedEnergy: new Energy(raw.generatedEnergy),
        });

      case CardType.Stage:
        if (raw.generatedEnergy === undefined) {
          throw new Error(`Stage card ${raw.id} must have generatedEnergy.`);
        }

        return new StageCard({
          ...commonData,
          generatedEnergy: new Energy(raw.generatedEnergy),
        });

      case CardType.Event:
        return new EventCard(commonData);

      default:
        throw new Error(`Unknown card type: ${raw.cardType}`);
    }
  }
}