import { Player } from "./Player";
import { PlayerId } from "../enum/PlayerId";

export class GameState {
    constructor(
        public readonly player1: Player,
        public readonly player2: Player,
        public currentPlayerId: PlayerId,
        public winner?: PlayerId
    ) {}

    public getCurrentPlayer(): Player {
        return this.currentPlayerId === PlayerId.Player1
            ? this.player1
            : this.player2;
    }

    public getOpponentPlayer(): Player {
        return this.currentPlayerId === PlayerId.Player1
            ? this.player2
            : this.player1;
    }
}