import { Game } from "../core/Game";
import { CpuActionGenerator } from "./CpuActionGenerator";
import { CpuActionExecutor } from "./CpuActionExecutor";
import { CpuAction } from "./CpuAction";

export class RandomCPU {
  public static playPhase(game: Game): void {
    if (game.winner) {
      return;
    }

    let guard = 0;

    while (!game.winner && guard < 20) {
      const actions = CpuActionGenerator.generate(game);

      if (actions.length === 0) {
        return;
      }

      const shuffled = this.shuffle(actions);

      let executed = false;

      for (const action of shuffled) {
        if (CpuActionExecutor.tryExecute(game, action)) {
          executed = true;

          if (action.type === "endPhase") {
            return;
          }

          break;
        }
      }

      if (!executed) {
        return;
      }

      guard++;
    }
  }

  private static shuffle<T>(items: T[]): T[] {
    return [...items].sort(() => Math.random() - 0.5);
  }
}