import { Game } from "../core/Game";
import { ActionPointRule } from "../rules/ActionPointRule";

export class StartPhaseAction {
  public static execute(game: Game): void {
    const currentPlayer = game.getCurrentPlayer();

    currentPlayer.board.activateAllCards();
        game.playerTurnCounts[game.currentPlayerId]++;

    const currentPlayerTurnCount = game.playerTurnCounts[game.currentPlayerId];

    if (!this.shouldSkipDraw(game, currentPlayerTurnCount)) {
    currentPlayer.board.draw(1);
    }

    const isFirstPlayer = game.currentPlayerId === game.firstPlayerId;
    const ap = ActionPointRule.calculate(isFirstPlayer, currentPlayerTurnCount);
    currentPlayer.board.setActionPoint(ap);
  }

  private static shouldSkipDraw(game: Game, currentPlayerTurnCount: number): boolean {
  return game.currentPlayerId === game.firstPlayerId && currentPlayerTurnCount === 1;
}
}