import { Game } from "../core/Game";
import { ActionPointRule } from "../rules/ActionPointRule";

export class StartPhaseAction {
  public static execute(game: Game): void {
    const currentPlayer = game.getCurrentPlayer();

    currentPlayer.board.activateAllCards();

    if (!this.shouldSkipDraw(game)) {
      currentPlayer.board.draw(1);
    }

    const isFirstPlayer = game.currentPlayerId === game.firstPlayerId;
    const ap = ActionPointRule.calculate(isFirstPlayer, game.turnCount);

    currentPlayer.board.setActionPoint(ap);
  }

  private static shouldSkipDraw(game: Game): boolean {
    return game.currentPlayerId === game.firstPlayerId && game.turnCount === 1;
  }
}