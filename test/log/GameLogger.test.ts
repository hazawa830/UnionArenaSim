import { describe, expect, it } from "vitest";

import { createTestGame } from "../helpers/createTestGame";
import { GameLogger } from "../../gameEngine/log/GameLogger";
import { LogType } from "../../gameEngine/enum/LogType";

describe("GameLogger", () => {
  it("ログにid, turn, phaseを自動付与して追加できる", () => {
    const game = createTestGame();
    const currentPlayer = game.getCurrentPlayer();

    const log = GameLogger.add(game, {
      playerId: currentPlayer.id,
      type: LogType.PlayCard,
      message: "月村 手毬を登場",
    });

    expect(game.logs).toHaveLength(1);

    expect(log).toMatchObject({
      id: 1,
      turn: game.turnCount,
      phase: game.phase,
      playerId: currentPlayer.id,
      type: LogType.PlayCard,
      message: "月村 手毬を登場",
    });

    expect(game.logs[0]).toBe(log);
    expect(game.nextLogId).toBe(2);
  });

  it("ログidは追加ごとに連番になる", () => {
    const game = createTestGame();
    const currentPlayer = game.getCurrentPlayer();

    const log1 = GameLogger.add(game, {
      playerId: currentPlayer.id,
      type: LogType.PlayCard,
      message: "1件目",
    });

    const log2 = GameLogger.add(game, {
      playerId: currentPlayer.id,
      type: LogType.Attack,
      message: "2件目",
    });

    expect(log1.id).toBe(1);
    expect(log2.id).toBe(2);
    expect(game.logs.map((log) => log.id)).toEqual([1, 2]);
    expect(game.nextLogId).toBe(3);
  });

  it("payload付きの詳細ログを追加できる", () => {
    const game = createTestGame();
    const currentPlayer = game.getCurrentPlayer();

    const payload = {
      cardId: "EX13BT_GIM-2-061",
      cardName: "月村 手毬",
      instanceId: 100,
      destination: "frontLine",
    };

    const log = GameLogger.add(game, {
      playerId: currentPlayer.id,
      type: LogType.PlayCard,
      message: "月村 手毬をフロントラインへ登場",
      payload,
    });

    expect(log.payload).toEqual(payload);
    expect(game.logs[0].payload).toEqual(payload);
  });
});