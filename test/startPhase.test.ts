import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { PlayCardAction} from "../gameEngine/actions/PlayCardAction";
import { AttackAction } from "../gameEngine/actions/AttackAction";
import { StartPhaseAction } from "../gameEngine/actions/StartPhaseAction";
import { PlayerId } from "../gameEngine/enum/PlayerId";
import {advanceToMainPhase,advanceToAttackPhase} from "./helpers/gamePhaseHelper";
import { BoardLine } from "../gameEngine/enum/BoardLine";
describe("StartPhaseAction", () => {
  it("ターン開始時に自分の場のカードがアクティブになり、1枚ドローし、APが更新される", () => {
    const game = createTestGame();

    const currentPlayer = game.getCurrentPlayer();
    currentPlayer.board.setActionPoint(3);
    advanceToMainPhase(game); 
    PlayCardAction.execute(game, 0, BoardLine.EnergyLine);
    PlayCardAction.execute(game, 0, BoardLine.FrontLine);
    currentPlayer.board.activateAllCards();
    advanceToAttackPhase(game)
    AttackAction.execute(game, 0);

    expect(currentPlayer.board.frontLine[0].getCard()?.isRest).toBe(true);

    const handBefore = currentPlayer.board.hand.length;
    const deckBefore = currentPlayer.board.deck.length;

    StartPhaseAction.execute(game);

    expect(currentPlayer.board.frontLine[0].getCard()?.isRest).toBe(false);
    expect(currentPlayer.board.energyLine[0].getCard()?.isRest).toBe(false);

    expect(currentPlayer.board.activeActionPoint).toBeGreaterThan(0);
  });

    it("先攻1ターン目はドローしない", () => {
    const game = createTestGame();

    const currentPlayer = game.getCurrentPlayer();

    expect(game.currentPlayerId).toBe(game.firstPlayerId);
    expect(game.playerTurnCounts[game.firstPlayerId]).toBe(1);

    expect(currentPlayer.board.hand.length).toBe(7);
    expect(currentPlayer.board.deck.length).toBe(36);
    });
    it("後攻1ターン目はドローする", () => {
        const game = createTestGame();

        game.currentPlayerId = game.firstPlayerId === PlayerId.Player1 ? PlayerId.Player2 : PlayerId.Player1;

        game.turnCount = 1;

        const currentPlayer = game.getCurrentPlayer();
        const handBefore = currentPlayer.board.hand.length;
        const deckBefore = currentPlayer.board.deck.length;

        StartPhaseAction.execute(game);

        expect(currentPlayer.board.hand.length).toBe(handBefore + 1);
        expect(currentPlayer.board.deck.length).toBe(deckBefore - 1);
    });
    
});