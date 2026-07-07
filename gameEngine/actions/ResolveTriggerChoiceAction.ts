import { Game } from "../core/Game";
import { CardInstance } from "../cards/CardInstance";
import { TriggerType } from "../enum/TriggerType";
import { EffectActionExecutor } from "../effects/EffectActionExecutor";
import { EffectContext } from "../effects/EffectContext";
import { EffectAction } from "../effects/EffectAction";
import { GameLogger } from "../log/GameLogger";
import { LogType } from "../enum/LogType";

export class ResolveTriggerChoiceAction {
  public static execute(
    game: Game,
    selectedTargets: CardInstance[]
  ): void {
    const pending = game.pendingTriggerChoice;

    if (!pending) {
      throw new Error("No pending trigger choice.");
    }

    const player =
      game.player1.id === pending.playerId ? game.player1 : game.player2;

    const opponent =
      game.player1.id === pending.opponentPlayerId
        ? game.player1
        : game.player2;

    const revealedCard = pending.revealedCard;

    const context: EffectContext = {
      game,
      source: revealedCard,
      actor: player,
      opponent,
      event: {
        selectedTargets,
      },
    };
    if (pending.triggerType === TriggerType.Active) {
      for (const target of selectedTargets) {
        target.isRest = false;
      }
    }
    const action = this.createAction(pending.triggerType);

    EffectActionExecutor.execute(context, action);

    player.board.trash.push(revealedCard);
    game.pendingTriggerChoice = undefined;

    GameLogger.add(game, {
      playerId: player.id,
      type: LogType.TriggerResult,
      message: `${revealedCard.card.name}のトリガーを解決`,
      payload: {
        result: "resolvedTriggerChoice",
        triggerType: pending.triggerType,
        cardInstanceId: revealedCard.instanceId,
        cardId: revealedCard.card.id,
        cardName: revealedCard.card.name,
      },
    });
  }

  private static createAction(triggerType: TriggerType): EffectAction {
    switch (triggerType) {
      case TriggerType.Active:
        return {
          type: "modifyBpThisTurn",
          target: {
            side: "own",
            zone: "frontLine",
            cardType: "character",
            maxCount: 1,
          },
          amount: 3000,
        };

      case TriggerType.Special:
        return {
          type: "destroy",
          target: {
            side: "opponent",
            zone: "frontLine",
            cardType: "character",
            maxCount: 1,
          },
        };

      default:
        throw new Error(`Unsupported pending trigger choice: ${triggerType}`);
    }
  }
}