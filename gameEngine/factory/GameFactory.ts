import gimDeckJson from "../cards/sample/test-GIMDeck.json";
import { gimCardJsons } from "../cards/data/cardDataIndex";

import { Board } from "../core/Board";
import { Game } from "../core/Game";
import { Player } from "../core/Player";
import { DeckFactory } from "../deck/DeckFactory";
import { CardMasterFactory } from "../cards/CardMasterFactory";

export class GameFactory {
  public static createSampleGame(): Game {
    const cardMaster = CardMasterFactory.create(gimCardJsons);

    const player1Deck = DeckFactory.create(gimDeckJson as any, cardMaster);
    const player2Deck = DeckFactory.create(gimDeckJson as any, cardMaster);

    const player1 = new Player("player1", "Player 1", new Board(player1Deck));
    const player2 = new Player("player2", "Player 2", new Board(player2Deck));

    const game = new Game(player1, player2);
    game.start();

    return game;
  }
}