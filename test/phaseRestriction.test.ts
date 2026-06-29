import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { advanceToMainPhase, advanceToAttackPhase } from "./helpers/gamePhaseHelper";

import { BoardLine } from "../gameEngine/enum/BoardLine";
import { ActionSource } from "../gameEngine/enum/ActionSource";

import { PlayCardAction } from "../gameEngine/actions/PlayCardAction";
import { MoveCardAction } from "../gameEngine/actions/MoveAction";
import { AttackAction } from "../gameEngine/actions/AttackAction";

describe("Phase restrictions", () => {
  it("通常プレイはMainフェーズ以外ではできない", () => {
    const game = createTestGame();

    expect(() => {
      PlayCardAction.execute(game, 0, BoardLine.EnergyLine);
    }).toThrow("Normal play is only allowed in main phase.");

    advanceToMainPhase(game);

    expect(() => {
      PlayCardAction.execute(game, 0, BoardLine.EnergyLine);
    }).not.toThrow();
  });

  it("通常移動はMoveフェーズ以外ではできない", () => {
    const game = createTestGame();

    advanceToMainPhase(game);
    PlayCardAction.execute(game, 0, BoardLine.EnergyLine);

    expect(() => {
      MoveCardAction.execute(
        game,
        BoardLine.EnergyLine,
        0,
        BoardLine.FrontLine,
        0
      );
    }).toThrow("Normal move is only allowed in move phase.");
  });

  it("通常攻撃はAttackフェーズ以外ではできない", () => {
    const game = createTestGame();

    advanceToMainPhase(game);
    
    PlayCardAction.execute(game, 0, BoardLine.FrontLine);
    game.player1.board.activateAllCards();
    game.player2.board.activateAllCards();
    expect(() => {
      AttackAction.execute(game, 0);
    }).toThrow("Normal attack is only allowed in attack phase.");

    advanceToAttackPhase(game);

    expect(() => {
      AttackAction.execute(game, 0);
    }).not.toThrow();
  });

  it("カード効果扱いならフェーズ制限を無視できる", () => {
    const game = createTestGame();

    expect(() => {
      PlayCardAction.execute(
        game,
        0,
        BoardLine.EnergyLine,
        ActionSource.CardEffect
      );
    }).not.toThrow();

    expect(() => {
      MoveCardAction.execute(
        game,
        BoardLine.EnergyLine,
        0,
        BoardLine.FrontLine,
        0,
        ActionSource.CardEffect
      );
    }).not.toThrow();
  });
});