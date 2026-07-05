import { Player } from "./Player";

export class GameSetup {

    public static setup(player1: Player, player2: Player): void {
        this.shuffle(player1.board.deck);
        this.shuffle(player2.board.deck);
        this.setupPlayer(player1);

        this.setupPlayer(player2);
        

    }

    private static setupPlayer(player: Player): void {
        player.board.draw(7);

        player.board.addToLifeFromDeck(7);

    }
    private static shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    }

}