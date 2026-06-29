import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { ExtraDrawAction } from "../gameEngine/actions/ExtraDrawAction";
import { GamePhase } from "../gameEngine/enum/GamePhase";

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
});