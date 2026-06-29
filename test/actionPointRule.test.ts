import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { PlayerId } from "../gameEngine/enum/PlayerId";

describe("ActionPointRule", () => {
  it("先攻のAPは 1 → 2 → 3 と増える", () => {
    const game = createTestGame();

    const firstPlayerId = game.firstPlayerId;

    expect(game.playerTurnCounts[firstPlayerId]).toBe(1);
    expect(game.getCurrentPlayer().board.activeActionPoint).toBe(1);

    // 後攻1ターン目へ
    while (game.currentPlayerId === firstPlayerId) {
      game.nextPhase();
    }

    // 先攻2ターン目へ
    while (game.currentPlayerId !== firstPlayerId) {
      game.nextPhase();
    }

    expect(game.playerTurnCounts[firstPlayerId]).toBe(2);
    expect(game.getCurrentPlayer().board.activeActionPoint).toBe(2);

    // 後攻2ターン目へ
    while (game.currentPlayerId === firstPlayerId) {
      game.nextPhase();
    }

    // 先攻3ターン目へ
    while (game.currentPlayerId !== firstPlayerId) {
      game.nextPhase();
    }

    expect(game.playerTurnCounts[firstPlayerId]).toBe(3);
    expect(game.getCurrentPlayer().board.activeActionPoint).toBe(3);
  });

  it("後攻のAPは 2 → 2 → 3 と増える", () => {
    const game = createTestGame();

    const secondPlayerId =
      game.firstPlayerId === PlayerId.Player1
        ? PlayerId.Player2
        : PlayerId.Player1;

    // 後攻1ターン目へ
    while (game.currentPlayerId !== secondPlayerId) {
      game.nextPhase();
    }

    expect(game.playerTurnCounts[secondPlayerId]).toBe(1);
    expect(game.getCurrentPlayer().board.activeActionPoint).toBe(2);

    // 先攻2ターン目へ
    while (game.currentPlayerId === secondPlayerId) {
      game.nextPhase();
    }

    // 後攻2ターン目へ
    while (game.currentPlayerId !== secondPlayerId) {
      game.nextPhase();
    }

    expect(game.playerTurnCounts[secondPlayerId]).toBe(2);
    expect(game.getCurrentPlayer().board.activeActionPoint).toBe(2);

    // 先攻3ターン目へ
    while (game.currentPlayerId === secondPlayerId) {
      game.nextPhase();
    }

    // 後攻3ターン目へ
    while (game.currentPlayerId !== secondPlayerId) {
      game.nextPhase();
    }

    expect(game.playerTurnCounts[secondPlayerId]).toBe(3);
    expect(game.getCurrentPlayer().board.activeActionPoint).toBe(3);
  });
});