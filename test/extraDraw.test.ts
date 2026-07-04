import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { ExtraDrawAction } from "../gameEngine/actions/ExtraDrawAction";
import { GamePhase } from "../gameEngine/enum/GamePhase";
import { ActionSource } from "../gameEngine/enum/ActionSource";
import { LogType } from "../gameEngine/enum/LogType";
import { EffectLogType } from "../gameEngine/enum/EffectLogType";

describe("ExtraDrawAction", () => {
  it("StartフェーズでAPを1払って1枚引ける", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    const handBefore = player.board.hand.length;
    const deckBefore = player.board.deck.length;
    const apBefore = player.board.activeActionPoint;

    ExtraDrawAction.execute(game);

    expect(player.board.hand.length).toBe(handBefore + 1);
    expect(player.board.deck.length).toBe(deckBefore - 1);
    expect(player.board.activeActionPoint).toBe(apBefore - 1);
  });

  it("APが足りない場合はエラーになる", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    player.board.setActionPoint(0);

    expect(() => {
      ExtraDrawAction.execute(game);
    }).toThrow("Not enough action points.");
  });

  it("Startフェーズ以外では通常のエクストラドローはできない", () => {
    const game = createTestGame();

    game.nextPhase(); // Start -> Move

    expect(game.phase).toBe(GamePhase.Move);

    expect(() => {
      ExtraDrawAction.execute(game);
    }).toThrow("Extra draw is only allowed in start phase.");
  });

  it("エクストラドローするとEffectログが追加される", () => {
  const game = createTestGame();
  const player = game.getCurrentPlayer();

  expect(game.phase).toBe(GamePhase.Start);

  const apBefore = player.board.activeActionPoint;
  const handBefore = player.board.hand.length;
  const deckBefore = player.board.deck.length;

  ExtraDrawAction.execute(game);

  expect(player.board.activeActionPoint).toBe(apBefore - 1);
  expect(player.board.hand.length).toBe(handBefore + 1);
  expect(player.board.deck.length).toBe(deckBefore - 1);

  expect(game.logs).toHaveLength(1);

  const log = game.logs[0];

  expect(log.type).toBe(LogType.Effect);
  expect(log.playerId).toBe(player.id);
  expect(log.message).toContain("エクストラドロー");

  expect(log.payload).toMatchObject({
    effectType: EffectLogType.ExtraDraw,
    actionSource: ActionSource.PlayerNormal,
    apBefore,
    apAfter: apBefore - 1,
    handBefore,
    handAfter: handBefore + 1,
    deckBefore,
    deckAfter: deckBefore - 1,
  });
});
});