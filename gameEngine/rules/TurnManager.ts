import { Game } from "../core/Game";
import { StartPhaseAction } from "../actions/StartPhaseAction";
import { GamePhase } from "../enum/GamePhase";
import { PlayerId } from "../enum/PlayerId";
import { GameLogger } from "../log/GameLogger";
import { LogType } from "../enum/LogType";

export class TurnManager {
  public static startTurn(game: Game): void {
    game.phase = GamePhase.Start;
    StartPhaseAction.execute(game);

    const currentPlayer = game.getCurrentPlayer();

    GameLogger.add(game, {
      playerId: currentPlayer.id,
      type: LogType.TurnStart,
      message: `${currentPlayer.name}のターン開始`,
      payload: {
        currentPlayerId: game.currentPlayerId,
        turnCount: game.turnCount,
        phase: game.phase,
      },
    });
  }

  public static nextPhase(game: Game): void {
    const beforePhase = game.phase;
    const player = game.getCurrentPlayer();

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
        return;
    }

    GameLogger.add(game, {
      playerId: player.id,
      type: LogType.PhaseChange,
      message: `${beforePhase}から${game.phase}へ進行`,
      payload: {
        from: beforePhase,
        to: game.phase,
        currentPlayerId: game.currentPlayerId,
      },
    });
  }

  public static endTurn(game: Game): void {
    const currentPlayer = game.getCurrentPlayer();

    GameLogger.add(game, {
      playerId: currentPlayer.id,
      type: LogType.TurnEnd,
      message: `${currentPlayer.name}のターン終了`,
      payload: {
        currentPlayerId: game.currentPlayerId,
        turnCount: game.turnCount,
      },
    });

    currentPlayer.board.activateAllCards();

    game.currentPlayerId =
      game.currentPlayerId === PlayerId.Player1
        ? PlayerId.Player2
        : PlayerId.Player1;

    game.player1.board.clearTemporaryBpBonus();
    game.player2.board.clearTemporaryBpBonus();
    game.player1.board.clearUsedEffectIdsThisTurn();
    game.player2.board.clearUsedEffectIdsThisTurn();
    game.turnCount++;

    this.startTurn(game);
  }
}