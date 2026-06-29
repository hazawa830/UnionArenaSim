import { Board } from "./Board";

export class Player {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly board: Board
    ) {}
}