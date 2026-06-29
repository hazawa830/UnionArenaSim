import { Energy } from "../models/Energy";
import { Card } from "./Card";
import { CharacterCardData } from "./CardData";

export class CharacterCard extends Card {

    public readonly bp: number;
    public readonly generatedEnergy: Energy;

    constructor(data: CharacterCardData) {
        super(data);

        this.bp = data.bp;
        this.generatedEnergy = data.generatedEnergy;
    }

}