import { Card } from "./Card";

export class CardInstance {

    constructor(
        public readonly instanceId: number,
        public readonly card: Card,
        public isRest: boolean = false,
        public temporaryBpBonus: number = 0
    ) {}

}