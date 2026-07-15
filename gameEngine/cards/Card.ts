import { Energy } from "../models/Energy";
import { CardData } from "./CardData";
import { CardType } from "../enum/CardType";
import { TriggerType } from "../enum/TriggerType";
import { Effect } from "../effects/Effect";
import { Keyword } from "./keywords/KeywordAbility";
import type { RaidCondition } from "../raid/RaidCondition";

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
    public readonly keywords: Keyword[];
    public readonly raidConditions: RaidCondition[];
    public readonly raidEffects: Effect[];
    public readonly raidKeywords: Keyword[];
    public readonly features: string[];

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
        this.keywords = data.keywords ?? [];
        this.raidConditions = data.raidConditions ?? [];
        this.raidEffects = data.raidEffects ?? [];
        this.raidKeywords = data.raidKeywords ?? [];
        this.features = data.features ?? [];
        
    }
    public hasKeyword(type: Keyword["type"]): boolean {
        return this.keywords.some((keyword) => keyword.type === type);
    }
    public hasFeature(feature: string): boolean {
        return this.features.includes(feature);
    }
    public hasAnyFeature(features: string[]): boolean {
        return features.some((feature) => this.features.includes(feature));
    }

    public hasAllFeatures(features: string[]): boolean {
        return features.every((feature) => this.features.includes(feature));
    }
}