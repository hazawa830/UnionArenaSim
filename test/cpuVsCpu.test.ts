import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { RandomCPU } from "../gameEngine/cpu/RandomCPU";

describe("CPU vs CPU", () => {
  it("ランダムCPU同士でゲームが最後まで完走する", () => {
    const game = createTestGame();

    let loopCount = 0;
    const maxLoopCount = 500;

    while (!game.winner && loopCount < maxLoopCount) {
      RandomCPU.playPhase(game);
      loopCount++;
    }

    expect(game.winner).toBeDefined();
    expect(loopCount).toBeLessThan(maxLoopCount);
  });
});