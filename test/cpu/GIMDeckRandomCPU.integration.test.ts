import { describe, expect, it } from "vitest";

import { RandomCPU } from "../../gameEngine/cpu/RandomCPU";
import { createGIMTestGame } from "../helpers/createGIMTestGame";

describe("GIM sample deck vs RandomCPU", () => {
  it("サンプルデッキ同士で複数フェーズ進めても例外が発生しない", () => {
    const game = createGIMTestGame();

    for (let i = 0; i < 100; i++) {
      expect(() => RandomCPU.playPhase(game)).not.toThrow();

      if (game.winner) {
        break;
      }
    }

    expect(game.phase).toBeDefined();
  });
});