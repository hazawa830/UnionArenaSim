import gimDeckJson from "./test-GIMDeck.json";

import { Board } from "../../gameEngine/core/Board";
import { Game } from "../../gameEngine/core/Game";
import { Player } from "../../gameEngine/core/Player";
import { DeckFactory } from "../../gameEngine/deck/DeckFactory";
import { CardMasterFactory } from "../../gameEngine/cards/CardMasterFactory";
import { gimCardJsons } from "../../gameEngine/cards/data/cardDataIndex";

export function createGIMTestGame(): Game {
  const cardMaster = CardMasterFactory.create(gimCardJsons);

  const player1Deck = DeckFactory.create(gimDeckJson as any, cardMaster);
  const player2Deck = DeckFactory.create(gimDeckJson as any, cardMaster);

  const player1 = new Player("player1", "Player 1", new Board(player1Deck));
  const player2 = new Player("player2", "Player 2", new Board(player2Deck));

  const game = new Game(player1, player2);
  game.start();

  return game;
}