import { Game } from "../core/Game";
import { GameLog } from "./GameLog";

export class GameLogger {
  public static add(
    game: Game,
    log: Omit<GameLog, "id" | "turn" | "phase">
  ): GameLog {
    const gameLog: GameLog = {
      id: game.nextLogId,
      turn: game.turnCount,
      phase: game.phase,
      ...log,
    };

    game.logs.push(gameLog);
    game.nextLogId++;

    return gameLog;
  }
}