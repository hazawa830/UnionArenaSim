import { Energy } from "../models/Energy";
import { Card } from "./Card";
import { StageCardData } from "./CardData";

export class StageCard extends Card {

    public readonly generatedEnergy: Energy;

    constructor(data: StageCardData) {
        super(data);

        this.generatedEnergy = data.generatedEnergy;
    }

}