import { Energy } from "../models/Energy";
import { CardData } from "./CardData";
import { CardType } from "../enum/CardType";
import { TriggerType } from "../enum/TriggerType";
import { Effect } from "../effects/Effect";
export abstract class Card {
    public readonly id: string;
    public readonly name: string;
    public readonly imagePath?: string;
    public readonly requiredEnergy: Energy;
    public readonly actionPointCost: number;
    public readonly cardType: CardType;
    public readonly effects: Effect[];
    public readonly triggerType: TriggerType;
    public readonly color?: string;

    constructor(data: CardData) {
        this.id = data.id;
        this.name = data.name;
        this.imagePath = data.imagePath;
        this.requiredEnergy = data.requiredEnergy;
        this.actionPointCost = data.actionPointCost;
        this.cardType = data.cardType;
        this.effects = data.effects ?? [];
        this.triggerType = data.triggerType;
        this.color = data.color;
    }
}