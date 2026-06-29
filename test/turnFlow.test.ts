import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { GamePhase } from "../gameEngine/enum/GamePhase";

describe("Turn flow", () => {
  it("フェーズが順番に進み、End後に相手ターンのStartへ進む", () => {
    const game = createTestGame();

    const firstPlayer = game.getCurrentPlayer();
    const firstPlayerHandBefore = firstPlayer.board.hand.length;

    expect(game.phase).toBe(GamePhase.Start);

    game.nextPhase();
    expect(game.phase).toBe(GamePhase.Move);

    game.nextPhase();
    expect(game.phase).toBe(GamePhase.Main);

    game.nextPhase();
    expect(game.phase).toBe(GamePhase.Attack);

    game.nextPhase();
    expect(game.phase).toBe(GamePhase.End);

    const opponentBeforeEnd = game.getOpponentPlayer();
    const opponentHandBefore = opponentBeforeEnd.board.hand.length;

    game.nextPhase();

    expect(game.phase).toBe(GamePhase.Start);
    expect(game.getCurrentPlayer()).toBe(opponentBeforeEnd);

    expect(game.getCurrentPlayer().board.hand.length).toBe(opponentHandBefore + 1);

    expect(firstPlayer.board.hand.length).toBe(firstPlayerHandBefore);
  });
});