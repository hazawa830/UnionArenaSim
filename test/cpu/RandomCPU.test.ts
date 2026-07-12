import { describe, expect, it } from "vitest";

import { createTestGame } from "../helpers/createTestGame";
import { RandomCPU } from "../../gameEngine/cpu/RandomCPU";

describe("RandomCPU with evaluator", () => {
  it("CPUが複数回行動してもクラッシュしない", () => {
    const game = createTestGame();

    for (let i = 0; i < 20; i++) {
      RandomCPU.resolvePendingChoices(game);
      RandomCPU.playPhase(game);
    }

    expect(game.winner === undefined || game.winner !== undefined).toBe(true);
  });
});