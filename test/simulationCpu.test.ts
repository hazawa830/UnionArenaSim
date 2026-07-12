import { describe, expect, it } from "vitest";

import { GameFactory } from "../gameEngine/factory/GameFactory";
import { SimulationCPU } from "../gameEngine/cpu/SimulationCPU";

describe("SimulationCPU", () => {
  it("CPUが1回行動してもクラッシュしない", () => {
    const game = GameFactory.createSampleGame();

    expect(() => {
      SimulationCPU.playPhase(game, {
        simulationsPerAction: 2,
        playoutSteps: 3,
      });
    }).not.toThrow();
  });

  it("CPUが複数回行動してもクラッシュしない", () => {
    const game = GameFactory.createSampleGame();

    expect(() => {
      for (let i = 0; i < 20; i++) {
        SimulationCPU.playPhase(game, {
          simulationsPerAction: 2,
          playoutSteps: 3,
        });
      }
    }).not.toThrow();
  });
});