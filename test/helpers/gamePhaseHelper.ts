import { Game} from "../../gameEngine/core/Game";
import { GamePhase } from "../../gameEngine/enum/GamePhase";
export function advanceToMovePhase(game: Game): void {
  advanceToPhase(game, GamePhase.Move);
}

export function advanceToMainPhase(game: Game): void {
  advanceToPhase(game, GamePhase.Main);
}

export function advanceToAttackPhase(game: Game): void {
  advanceToPhase(game, GamePhase.Attack);
}

export function advanceToEndPhase(game: Game): void {
  advanceToPhase(game, GamePhase.End);
}

function advanceToPhase(game: Game, targetPhase: GamePhase): void {
  let guard = 0;

  while (game.phase !== targetPhase) {
    game.nextPhase();

    guard++;

    if (guard > 10) {
      throw new Error(`Failed to advance to phase: ${targetPhase}`);
    }
  }
}