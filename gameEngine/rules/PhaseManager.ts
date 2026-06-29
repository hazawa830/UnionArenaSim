import { Game} from "../core/Game";
import { GamePhase } from "../enum/GamePhase";
export class PhaseManager {
  public static nextPhase(game: Game): void {
    switch (game.phase) {
      case GamePhase.Start:
        game.phase = GamePhase.Move;
        break;

      case GamePhase.Move:
        game.phase = GamePhase.Main;
        break;

      case GamePhase.Main:
        game.phase = GamePhase.Attack;
        break;

      case GamePhase.Attack:
        game.phase = GamePhase.End;
        break;

      case GamePhase.End:
        throw new Error("End phase should be handled by TurnManager.endTurn().");
    }
  }

  public static requirePhase(game: Game, phase: GamePhase): void {
    if (game.phase !== phase) {
      throw new Error(`Invalid phase. Current=${game.phase}, Required=${phase}`);
    }
  }
}