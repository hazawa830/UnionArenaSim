import sampleCardJson from "../cards/data/loki.json";
import sampleDeckJson from "../deck/sample-deck.json";

import { Board } from "../core/Board";
import { Game } from "../core/Game";
import { Player } from "../core/Player";
import { CardFactory } from "../cards/CardFactory";
import { DeckFactory } from "../deck/DeckFactory";

export class GameFactory {
  public static createSampleGame(): Game {
    const sampleCard = CardFactory.create(sampleCardJson);
    const cardMaster = new Map([[sampleCard.id, sampleCard]]);

    const player1Deck = DeckFactory.create(sampleDeckJson, cardMaster);
    const player2Deck = DeckFactory.create(sampleDeckJson, cardMaster);

    const player1 = new Player("player1", "Player 1", new Board(player1Deck));
    const player2 = new Player("player2", "Player 2", new Board(player2Deck));

    const game = new Game(player1, player2);
    game.start();

    return game;
  }
}