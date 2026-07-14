import { Game } from "../core/Game";
import { GameCloner } from "../core/GameCloner";
import { CpuAction } from "./CpuAction";
import { CpuActionGenerator } from "./CpuActionGenerator";
import { CpuActionExecutor } from "./CpuActionExecutor";
import { GameStateEvaluator } from "./GameStateEvaluator";
import { RandomCPU } from "./RandomCPU";
import { CpuActionEvaluator } from "./CpuActionEvaluator";
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

    if (RandomCPU.resolvePendingChoices(game)) {
      return;
    }

    const actions = CpuActionGenerator.generate(game);

    if (actions.length === 0) {
      return;
    }

    const playerId = game.getCurrentPlayer().id;

    const bestAction = this.selectBestAction(game, playerId, actions, {/////////////////////////
      simulationsPerAction: options.simulationsPerAction ?? 100,
      playoutSteps: options.playoutSteps ?? 100,
    });

    CpuActionExecutor.tryExecute(game, bestAction);
  }

  private static selectBestAction(
    game: Game,
    playerId: string,
    actions: CpuAction[],
    options: Required<SimulationOptions>
  ): CpuAction {
    let bestAction = actions[0];
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const action of actions) {
      const score = this.evaluateActionBySimulation(
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

    const actionScore = CpuActionEvaluator.score(game, action);

    for (let i = 0; i < options.simulationsPerAction; i++) {
      const clonedGame = GameCloner.clone(game);

      const executed = CpuActionExecutor.tryExecute(clonedGame, action);

      if (!executed) {
        continue;
      }

      this.playout(clonedGame, options.playoutSteps);

      const stateScore = GameStateEvaluator.evaluate(
        clonedGame,
        playerId
      );

      totalScore += stateScore + actionScore * 100;
      successCount++;
    }

    if (successCount === 0) {
      return Number.NEGATIVE_INFINITY;
    }

    return totalScore / successCount;
  }

  private static playout(game: Game, steps: number): void {
    for (let i = 0; i < steps; i++) {
      if (game.winner) {
        return;
      }

      if (RandomCPU.resolvePendingChoices(game)) {
        continue;
      }

      const actions = CpuActionGenerator.generate(game);

      if (actions.length === 0) {
        return;
      }

      const shuffledActions = this.shuffle(actions);

      for (const action of shuffledActions) {
        if (CpuActionExecutor.tryExecute(game, action)) {
          break;
        }
      }
    }
  }

  private static shuffle<T>(items: T[]): T[] {
    return [...items].sort(() => Math.random() - 0.5);
  }
}