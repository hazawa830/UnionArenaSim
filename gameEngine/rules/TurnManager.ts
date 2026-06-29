import { Game} from "../core/Game";
import { StartPhaseAction } from "../actions/StartPhaseAction";
import { GamePhase } from "../enum/GamePhase";
import { PlayerId } from "../enum/PlayerId";
export class TurnManager {
  public static startTurn(game: Game): void {
    game.phase = GamePhase.Start;
    StartPhaseAction.execute(game);
  }

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
        this.endTurn(game);
        break;
    }
  }

  public static endTurn(game: Game): void {
    const currentPlayer = game.getCurrentPlayer();

    currentPlayer.board.activateAllCards();

    game.currentPlayerId =
      game.currentPlayerId === PlayerId.Player1
        ? PlayerId.Player2
        : PlayerId.Player1;

    game.turnCount++;

    this.startTurn(game);
  }
}