import { describe, expect, it } from "vitest";

import { createTestGame } from "../helpers/createTestGame";
import { BoardLine } from "../../gameEngine/enum/BoardLine";
import { CpuActionEvaluator } from "../../gameEngine/cpu/CpuActionEvaluator";
import type { CpuAction } from "../../gameEngine/cpu/CpuAction";

describe("CpuActionEvaluator", () => {
  it("攻撃はフェーズ終了より高く評価される", () => {
    const game = createTestGame();

    const attackAction: CpuAction = {
      type: "attack",
      attackerIndex: 0,
      attackTarget: { type: "player" },
    };

    const endPhaseAction: CpuAction = {
      type: "endPhase",
    };

    expect(CpuActionEvaluator.score(game, attackAction)).toBeGreaterThan(
      CpuActionEvaluator.score(game, endPhaseAction)
    );
  });

  it("序盤はフロント登場よりエナジー登場を高く評価する", () => {
    const game = createTestGame();

    const playToFrontAction: CpuAction = {
      type: "playCard",
      handIndex: 0,
      destination: BoardLine.FrontLine,
    };

    const playToEnergyAction: CpuAction = {
      type: "playCard",
      handIndex: 0,
      destination: BoardLine.EnergyLine,
    };

    expect(CpuActionEvaluator.score(game, playToEnergyAction)).toBeGreaterThan(
      CpuActionEvaluator.score(game, playToFrontAction)
    );
  });

  it("レイドは通常登場より高く評価される", () => {
    const game = createTestGame();

    const playToFrontAction: CpuAction = {
      type: "playCard",
      handIndex: 0,
      destination: BoardLine.FrontLine,
    };

    const raidAction: CpuAction = {
      type: "raidPlay",
      handIndex: 0,
      baseLine: BoardLine.FrontLine,
      baseIndex: 0,
    };

    expect(CpuActionEvaluator.score(game, raidAction)).toBeGreaterThan(
      CpuActionEvaluator.score(game, playToFrontAction)
    );
  });

  it("エナジーからフロントへの移動はフェーズ終了より高く評価される", () => {
    const game = createTestGame();

    const moveAction: CpuAction = {
      type: "move",
      fromLine: BoardLine.EnergyLine,
      fromIndex: 0,
      toLine: BoardLine.FrontLine,
      toIndex: 0,
    };

    const endPhaseAction: CpuAction = {
      type: "endPhase",
    };

    expect(CpuActionEvaluator.score(game, moveAction)).toBeGreaterThan(
      CpuActionEvaluator.score(game, endPhaseAction)
    );
  });

  it("Stepでフロントからエナジーへ下がる行動は、前に出る行動より低く評価される", () => {
    const game = createTestGame();

    const moveForwardAction: CpuAction = {
      type: "move",
      fromLine: BoardLine.EnergyLine,
      fromIndex: 0,
      toLine: BoardLine.FrontLine,
      toIndex: 0,
    };

    const moveBackAction: CpuAction = {
      type: "move",
      fromLine: BoardLine.FrontLine,
      fromIndex: 0,
      toLine: BoardLine.EnergyLine,
      toIndex: 0,
    };

    expect(CpuActionEvaluator.score(game, moveForwardAction)).toBeGreaterThan(
      CpuActionEvaluator.score(game, moveBackAction)
    );
  });
});