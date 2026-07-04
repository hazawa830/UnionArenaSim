import { describe, expect, it } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { RandomCPU } from "../gameEngine/cpu/RandomCPU";

describe("RandomCPU integration", () => {
  it("Player vs RandomCPU を複数フェーズ進めても例外が発生しない", () => {
    const game = createTestGame();

    for (let i = 0; i < 50; i++) {
      expect(() => {
        RandomCPU.playPhase(game);
      }).not.toThrow();

      if (game.winner) {
        break;
      }
    }

    expect(game.phase).toBeDefined();
  });

  it("RandomCPU同士で数ターン進めても例外が発生しない", () => {
    const game = createTestGame();

    for (let i = 0; i < 100; i++) {
      expect(() => {
        RandomCPU.playPhase(game);
      }).not.toThrow();

      if (game.winner) {
        break;
      }
    }

    expect(game.phase).toBeDefined();
  });
});