import { Energy } from "../models/Energy";
import { CardType } from "../enum/CardType";

import { TriggerType } from "../enum/TriggerType";
import { Effect } from "../effects/Effect";
import { Keyword } from "./keywords/KeywordAbility";
import type { RaidCondition } from "../raid/RaidCondition";

export type CardData = {
  id: string;
  name: string;
  imagePath?: string;
  cardType: CardType;
  requiredEnergy: Energy;
  actionPointCost: number;
  features?: string[];
  effects?: Effect[];
  triggerType: TriggerType;
  color?: string;
  keywords?: Keyword[];
  raidConditions?: RaidCondition[];
  raidEffects?: Effect[];
  raidKeywords?: Keyword[];
};

export interface CharacterCardData extends CardData {
    bp: number;
    generatedEnergy: Energy;
}

export interface StageCardData extends CardData {
    generatedEnergy: Energy;
}

export interface EventCardData extends CardData {

}
