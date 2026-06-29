import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { advanceToMainPhase, advanceToAttackPhase } from "./helpers/gamePhaseHelper";

import { GamePhase } from "../gameEngine/enum/GamePhase";
import { PlayCardAction} from "../gameEngine/actions/PlayCardAction";
import { AttackAction } from "../gameEngine/actions/AttackAction";
import { BoardLine } from "../gameEngine/enum/BoardLine";
describe("Game finish", () => {
  it("バニラカードで攻撃を繰り返して相手ライフを0にできる", () => {
    const game = createTestGame();

    const firstPlayer = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    advanceToMainPhase(game);
    firstPlayer.board.setActionPoint(3);
    PlayCardAction.execute(game, 0, BoardLine.EnergyLine);
    PlayCardAction.execute(game, 0, BoardLine.FrontLine);
    expect(opponent.board.lifeArea.length).toBe(7);
    firstPlayer.board.activateAllCards();
    for (let i = 0; i < 7; i++) {
      advanceToAttackPhase(game);
      
      AttackAction.execute(game, 0);

      expect(opponent.board.lifeArea.length).toBe(6 - i);

      // まだ勝っていないなら、同じプレイヤーの次ターン相当としてカードを起こす
      if (i < 6) {
        firstPlayer.board.activateAllCards();
        game.phase = GamePhase.Main;
      }
    }

    expect(opponent.board.lifeArea.length).toBe(0);
    expect(game.winner).toBe(game.currentPlayerId);
  });
});