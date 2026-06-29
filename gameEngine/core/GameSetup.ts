import { Player } from "./Player";

export class GameSetup {

    public static setup(player1: Player, player2: Player): void {

        this.setupPlayer(player1);

        this.setupPlayer(player2);

    }

    private static setupPlayer(player: Player): void {
        player.board.draw(7);

        player.board.addToLifeFromDeck(7);

    }

}