import { Game } from "../core/Game";
import { CardInstance } from "../cards/CardInstance";
import { TriggerType } from "../enum/TriggerType";
import { EffectActionExecutor } from "../effects/EffectActionExecutor";
import { EffectContext } from "../effects/EffectContext";
import { EffectAction } from "../effects/EffectAction";
import { GameLogger } from "../log/GameLogger";
import { LogType } from "../enum/LogType";
import { CharacterCard } from "../cards/CharacterCard";

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

    if (pending.triggerType === TriggerType.Color) {
      const target = selectedTargets[0];

      if (!target) {
        throw new Error("カラートリガーの対象が選択されていません");
      }

      if (!(target.card instanceof CharacterCard)) {
        throw new Error("カラートリガーはキャラクターのみ対象にできます");
      }

      const targetIndex = opponent.board.frontLine.findIndex(
        (slot) => slot.getCard() === target
      );

      if (targetIndex === -1) {
        throw new Error("対象が相手フロントラインに存在しません");
      }

      const color = revealedCard.card.color;

      if (color === "blue") {
        if (target.getCurrentBp() > 3500) {
          throw new Error("青カラートリガーはBP3500以下のキャラしか選べません");
        }

        const returned = opponent.board.frontLine[targetIndex].removeCard();

        if (!returned) {
          throw new Error("対象を手札に戻せませんでした");
        }

        opponent.board.hand.push(returned);

        player.board.trash.push(revealedCard);
        game.pendingTriggerChoice = undefined;

        GameLogger.add(game, {
          playerId: player.id,
          type: LogType.TriggerResult,
          message: `${revealedCard.card.name}の青カラートリガーを解決`,
          payload: {
            result: "resolvedColorTrigger",
            color: "blue",
            effect: "returnToHand",
            triggerType: pending.triggerType,
            cardInstanceId: revealedCard.instanceId,
            cardId: revealedCard.card.id,
            cardName: revealedCard.card.name,
            returnedCardInstanceId: returned.instanceId,
            returnedCardId: returned.card.id,
            returnedCardName: returned.card.name,
            targetIndex,
          },
        });

        return;
      }

      if (color === "red") {
        if (target.getCurrentBp() > 2500) {
          throw new Error("赤カラートリガーはBP2500以下のキャラしか選べません");
        }

        const destroyed = opponent.board.frontLine[targetIndex].removeCard();

        if (!destroyed) {
          throw new Error("対象をトラッシュに置けませんでした");
        }

        opponent.board.trash.push(destroyed);

        player.board.trash.push(revealedCard);
        game.pendingTriggerChoice = undefined;

        GameLogger.add(game, {
          playerId: player.id,
          type: LogType.TriggerResult,
          message: `${revealedCard.card.name}の赤カラートリガーを解決`,
          payload: {
            result: "resolvedColorTrigger",
            color: "red",
            effect: "destroy",
            triggerType: pending.triggerType,
            cardInstanceId: revealedCard.instanceId,
            cardId: revealedCard.card.id,
            cardName: revealedCard.card.name,
            destroyedCardInstanceId: destroyed.instanceId,
            destroyedCardId: destroyed.card.id,
            destroyedCardName: destroyed.card.name,
            targetIndex,
          },
        });

        return;
      }

      throw new Error(`未対応のカラートリガーです: ${String(color)}`);
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