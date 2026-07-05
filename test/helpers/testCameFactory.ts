import sampleCardJson from "../../gameEngine/cards/data/loki.json";
import sampleDeckJson from "../../gameEngine/deck/sample-deck.json";

import { Board } from "../../gameEngine/core/Board";
import { Game } from "../../gameEngine/core/Game";
import { Player } from "../../gameEngine/core/Player";
import { CardFactory } from "../../gameEngine/cards/CardFactory";
import { DeckFactory } from "../../gameEngine/deck/DeckFactory";

export class TestGameFactory {
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