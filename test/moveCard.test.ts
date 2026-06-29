import { describe, it, expect } from "vitest";

import sampleCardJson from "../gameEngine/cards/data/loki.json";
import sampleDeckJson from "../gameEngine/deck/sample-deck.json";

import { Board } from "../gameEngine/core/Board";
import { Game } from "../gameEngine/core/Game";
import { Player } from "../gameEngine/core/Player";
import { CardFactory } from "../gameEngine/cards/CardFactory";
import { DeckFactory } from "../gameEngine/deck/DeckFactory";
import { PlayCardAction} from "../gameEngine/actions/PlayCardAction";
import { MoveCardAction} from "../gameEngine/actions/MoveAction";
import { BoardLine } from "../gameEngine/enum/BoardLine";

import { createTestGame } from "./helpers/createTestGame";
import {advanceToMainPhase,advanceToMovePhase} from "./helpers/gamePhaseHelper";
import { ActionSource } from "../gameEngine/enum/ActionSource";
describe("MoveCardAction", () => {
  it("エナジーラインのカードをフロントラインへ移動できる", () => {
    const game = createTestGame();

    const currentPlayer = game.getCurrentPlayer();
    advanceToMainPhase(game); 
    PlayCardAction.execute(game, 0, BoardLine.EnergyLine);

    expect(currentPlayer.board.energyLine[0].getCard()?.card.name).toBe("ロキ");
    expect(currentPlayer.board.frontLine[0].isEmpty()).toBe(true);
    
    MoveCardAction.execute(
      game,
      BoardLine.EnergyLine,
      0,
      BoardLine.FrontLine,
      0,
      ActionSource.CardEffect
    );

    expect(currentPlayer.board.energyLine[0].isEmpty()).toBe(true);
    expect(currentPlayer.board.frontLine[0].getCard()?.card.name).toBe("ロキ");
  });

  it("移動先にカードがある場合はエラーになる", () => {
    const sampleCard = CardFactory.create(sampleCardJson);
    const cardMaster = new Map([[sampleCard.id, sampleCard]]);

    const player1Deck = DeckFactory.create(sampleDeckJson, cardMaster);
    const player2Deck = DeckFactory.create(sampleDeckJson, cardMaster);

    const player1 = new Player("player1", "Player 1", new Board(player1Deck));
    const player2 = new Player("player2", "Player 2", new Board(player2Deck));

    const game = new Game(player1, player2);
    game.start();
    advanceToMainPhase(game); 
    player1.board.setActionPoint(3);
    player2.board.setActionPoint(3);
    PlayCardAction.execute(game, 0, BoardLine.EnergyLine);
    PlayCardAction.execute(game, 0, BoardLine.FrontLine);
    
    expect(() => {
      MoveCardAction.execute(
        game,
        BoardLine.EnergyLine,
        0,
        BoardLine.FrontLine,
        0,
        ActionSource.CardEffect
      );
    }).toThrow("Destination slot is not empty.");
  });
});