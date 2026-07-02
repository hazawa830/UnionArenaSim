import { Energy } from "../models/Energy";
import { Card } from "./Card";
import { CharacterCardData } from "./CardData";
import { Effect } from "../effects/Effect";
import { Keyword } from "./keywords/KeywordAbility";
import type { RaidCondition } from "../raid/RaidCondition";

export class CharacterCard extends Card {

    public readonly bp: number;
    public readonly generatedEnergy: Energy;
    public readonly raidConditions: RaidCondition[];
    public readonly raidEffects: Effect[];
    public readonly raidKeywords: Keyword[];
    constructor(data: CharacterCardData) {
        super(data);

        this.bp = data.bp;
        this.generatedEnergy = data.generatedEnergy;
        this.raidConditions = data.raidConditions ?? [];
        this.raidEffects = data.raidEffects ?? [];
        this.raidKeywords = data.raidKeywords ?? [];
    }

}