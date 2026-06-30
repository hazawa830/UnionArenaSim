import { Energy } from "../models/Energy";
import { CardType } from "../enum/CardType";

import { TriggerType } from "../enum/TriggerType";
import { Effect } from "../effects/Effect";
export type CardData = {
  id: string;
  name: string;
  imagePath?: string;
  cardType: CardType;
  requiredEnergy: Energy;
  actionPointCost: number;
  effects?: Effect[];
  triggerType: TriggerType;
  color?: string;
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
