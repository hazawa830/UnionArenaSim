import { Energy } from "../models/Energy";
import { CardData } from "./CardData";
import { CardType } from "../enum/CardType";

export abstract class Card {
    public readonly id: string;
    public readonly name: string;
    public readonly requiredEnergy: Energy;
    public readonly actionPointCost: number;
    public readonly cardType: CardType;
    public readonly effects: string[];
    public readonly trigger?: string;

    constructor(data: CardData) {
        this.id = data.id;
        this.name = data.name;
        this.requiredEnergy = data.requiredEnergy;
        this.actionPointCost = data.actionPointCost;
        this.cardType = data.cardType;
        this.effects = data.effects ?? [];
        this.trigger = data.trigger;
    }
}