import { Game } from "../core/Game";
import { GamePhase } from "../enum/GamePhase";
import { ActionSource } from "../enum/ActionSource";

export class ExtraDrawAction {
  public static execute(
    game: Game,
    source: ActionSource = ActionSource.PlayerNormal
  ): void {
    if (source === ActionSource.PlayerNormal && game.phase !== GamePhase.Start) {
      throw new Error("Extra draw is only allowed in start phase.");
    }

    const player = game.getCurrentPlayer();

    player.board.payActionPoint(1);
    player.board.draw(1);
  }
}