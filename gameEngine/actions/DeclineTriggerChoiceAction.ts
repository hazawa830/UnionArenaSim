import { Game } from "../core/Game";
import { GameLogger } from "../log/GameLogger";
import { LogType } from "../enum/LogType";

export class DeclineTriggerChoiceAction {
  public static execute(game: Game): void {
    const pending = game.pendingTriggerChoice;

    if (!pending) {
      throw new Error("選択中のトリガーがありません");
    }

    const player =
      game.player1.id === pending.playerId ? game.player1 : game.player2;

    const revealedCard = pending.revealedCard;

    player.board.trash.push(revealedCard);
    game.pendingTriggerChoice = undefined;

    GameLogger.add(game, {
      playerId: player.id,
      type: LogType.TriggerResult,
      message: `${revealedCard.card.name}のトリガーを使わずトラッシュに置いた`,
      payload: {
        result: "declinedTriggerChoice",
        triggerType: pending.triggerType,
        cardInstanceId: revealedCard.instanceId,
        cardId: revealedCard.card.id,
        cardName: revealedCard.card.name,
      },
    });
  }
}