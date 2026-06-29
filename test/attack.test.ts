import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { PlayCardAction} from "../gameEngine/actions/PlayCardAction";
import { AttackAction } from "../gameEngine/actions/AttackAction";
import { BoardLine } from "../gameEngine/enum/BoardLine";
import {advanceToMainPhase,advanceToAttackPhase} from "./helpers/gamePhaseHelper";

describe("AttackAction", () => {
  it("フロントラインのアクティブなカードで攻撃すると相手ライフが1減り、攻撃したカードはレストする", () => {
    const game = createTestGame();

    const currentPlayer = game.getCurrentPlayer();
    const opponentPlayer = game.getOpponentPlayer();
    advanceToMainPhase(game); 

    
    PlayCardAction.execute(game, 0, BoardLine.FrontLine);

    expect(opponentPlayer.board.lifeArea.length).toBe(7);
    expect(currentPlayer.board.frontLine[0].getCard()?.isRest).toBe(true);
    advanceToAttackPhase(game)
    currentPlayer.board.activateAllCards();
    AttackAction.execute(game, 0);

    expect(opponentPlayer.board.lifeArea.length).toBe(6);
    expect(opponentPlayer.board.trash.length).toBe(1);
    expect(currentPlayer.board.frontLine[0].getCard()?.isRest).toBe(true);
  });

  it("レストしているカードでは攻撃できない", () => {
    const game = createTestGame();
    advanceToMainPhase(game); 
    
    PlayCardAction.execute(game, 0, BoardLine.FrontLine);
    advanceToAttackPhase(game)
    game.player1.board.activateAllCards();
    game.player2.board.activateAllCards();
    AttackAction.execute(game, 0);

    expect(() => {
      AttackAction.execute(game, 0);
    }).toThrow("Rested card cannot attack.");
  });

  it("攻撃で相手ライフが0になると勝者が設定される", () => {
    const game = createTestGame();

    const currentPlayer = game.getCurrentPlayer();
    const opponentPlayer = game.getOpponentPlayer();
    advanceToMainPhase(game); 
    
    PlayCardAction.execute(game, 0, BoardLine.FrontLine);

    opponentPlayer.board.lifeArea.splice(0, opponentPlayer.board.lifeArea.length - 1);

    expect(opponentPlayer.board.lifeArea.length).toBe(1);
    advanceToAttackPhase(game)
    currentPlayer.board.activateAllCards();
    AttackAction.execute(game, 0);

    expect(opponentPlayer.board.lifeArea.length).toBe(0);
    expect(game.winner).toBe(game.currentPlayerId);
  });
});