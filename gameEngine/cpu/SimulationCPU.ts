import { Game } from "../core/Game";
import { GameCloner } from "../core/GameCloner";
import { GamePhase } from "../enum/GamePhase";

import type { CpuAction } from "./CpuAction";
import { CpuActionGenerator } from "./CpuActionGenerator";
import { CpuActionExecutor } from "./CpuActionExecutor";
import { GameStateEvaluator } from "./GameStateEvaluator";
import { RandomCPU } from "./RandomCPU";
import { CpuActionEvaluator } from "./CpuActionEvaluator";
import { CpuMainPhasePlanner } from "./CpuMainPhasePlanner";

const ACTION_SCORE_WEIGHT = 100;

const DEFAULT_SIMULATIONS_PER_ACTION = 2;
const DEFAULT_PLAYOUT_STEPS = 4;

type SimulationOptions = {
  simulationsPerAction?: number;
  playoutSteps?: number;
};

export class SimulationCPU {
  public static playPhase(
    game: Game,
    options: SimulationOptions = {}
  ): void {
    if (game.winner) {
      return;
    }

    try {
      if (
        RandomCPU.resolvePendingChoices(game)
      ) {
        return;
      }

      /*
       * Mainフェーズでは、まず現在の合法行動を確認する。
       */
      if (game.phase === GamePhase.Main) {
        const availableActions =
          CpuActionGenerator.generate(game);

        /*
         * レイド可能な場合はPlannerを使用しない。
         *
         * 後段のSimulationCPUで、
         * raidPlayと通常プレイを比較する。
         */
        const hasRaidPlay =
          availableActions.some(
            (action) =>
              action.type === "raidPlay"
          );

        if (!hasRaidPlay) {
          const plannedAction =
            CpuMainPhasePlanner.chooseNextAction(
              game
            );

          if (
            plannedAction &&
            CpuActionExecutor.tryExecute(
              game,
              plannedAction
            )
          ) {
            return;
          }
        }
      }

      const actions =
        CpuActionGenerator.generate(game);

      if (actions.length === 0) {
        return;
      }

      const playerId =
        game.getCurrentPlayer().id;

      const bestAction =
        this.selectBestAction(
          game,
          playerId,
          actions,
          {
            simulationsPerAction:
              options.simulationsPerAction ??
              DEFAULT_SIMULATIONS_PER_ACTION,

            playoutSteps:
              options.playoutSteps ??
              DEFAULT_PLAYOUT_STEPS,
          }
        );

      /*
       * 評価対象がすべて失敗した場合でも、
       * selectBestActionは候補の1つを返す。
       *
       * tryExecuteが失敗しても例外は外へ出さない。
       */
      CpuActionExecutor.tryExecute(
        game,
        bestAction
      );
    } catch (error) {
      /*
       * CPU処理中の例外で自動進行全体が
       *停止しないようにする。
       */
      console.warn(
        "SimulationCPU.playPhase failed.",
        error
      );
    }
  }

  private static selectBestAction(
    game: Game,
    playerId: string,
    actions: CpuAction[],
    options: Required<SimulationOptions>
  ): CpuAction {
    let bestAction = actions[0];
    let bestScore =
      Number.NEGATIVE_INFINITY;

    for (const action of actions) {
      const score =
        this.evaluateActionBySimulation(
          game,
          playerId,
          action,
          options
        );

      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    }

    return bestAction;
  }

  private static evaluateActionBySimulation(
    game: Game,
    playerId: string,
    action: CpuAction,
    options: Required<SimulationOptions>
  ): number {
    let totalScore = 0;
    let successCount = 0;

    const actionScore =
      CpuActionEvaluator.score(
        game,
        action
      );

    for (
      let simulationIndex = 0;
      simulationIndex <
      options.simulationsPerAction;
      simulationIndex++
    ) {
      try {
        const clonedGame =
          GameCloner.clone(game);

        const executed =
          CpuActionExecutor.tryExecute(
            clonedGame,
            action
          );

        if (!executed) {
          continue;
        }

        const playoutSucceeded =
          this.playout(
            clonedGame,
            options.playoutSteps
          );

        if (!playoutSucceeded) {
          continue;
        }

        const stateScore =
          GameStateEvaluator.evaluate(
            clonedGame,
            playerId
          );

        totalScore +=
          stateScore +
          actionScore *
            ACTION_SCORE_WEIGHT;

        successCount++;
      } catch (error) {
        /*
         * 1回のシミュレーション失敗は
         * その試行だけ無視する。
         */
        console.warn(
          "Action simulation failed.",
          {
            action,
            error,
          }
        );
      }
    }

    if (successCount === 0) {
      return Number.NEGATIVE_INFINITY;
    }

    return totalScore / successCount;
  }

  private static playout(
    game: Game,
    steps: number
  ): boolean {
    try {
      for (
        let step = 0;
        step < steps;
        step++
      ) {
        if (game.winner) {
          return true;
        }

        if (
          RandomCPU.resolvePendingChoices(
            game
          )
        ) {
          continue;
        }

        const actions =
          CpuActionGenerator.generate(game);

        if (actions.length === 0) {
          return true;
        }

        const shuffledActions =
          this.shuffle(actions);

        let executed = false;

        for (
          const action of shuffledActions
        ) {
          if (
            CpuActionExecutor.tryExecute(
              game,
              action
            )
          ) {
            executed = true;
            break;
          }
        }

        /*
         * 候補があるのにすべて実行不能なら
         * このプレイアウトは失敗扱い。
         */
        if (!executed) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.warn(
        "Simulation playout failed. " +
          "This simulation is ignored.",
        error
      );

      return false;
    }
  }

  private static shuffle<T>(
    items: T[]
  ): T[] {
    return [...items].sort(
      () => Math.random() - 0.5
    );
  }
}