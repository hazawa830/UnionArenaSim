import { Energy } from "../models/Energy";
import { CardType } from "../enum/CardType";

export interface CardData {
    id: string;
    name: string;
    imagePath?: string;
    requiredEnergy: Energy;
    actionPointCost: number;
    cardType: CardType;
    effects?: string[];
    trigger?: string;
}

export interface CharacterCardData extends CardData {
    bp: number;
    generatedEnergy: Energy;
}

export interface StageCardData extends CardData {
    generatedEnergy: Energy;
}

export interface EventCardData extends CardData {

}
