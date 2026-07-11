import { Game } from "../core/Game";
import { Player } from "../core/Player";
import { CardInstance } from "../cards/CardInstance";
import { TriggerType } from "../enum/TriggerType";
import { CharacterCard } from "../cards/CharacterCard";
import { DestroyEffectAction } from "../effects/actions/DestroyEffectAction";
import { EffectAction } from "../effects/EffectAction";
import { EffectContext } from "../effects/EffectContext";
import { RaidConditionResolver } from "../raid/RaidConditionResolver";

import { LogType } from "../enum/LogType";
import { GameLogger } from "../log/GameLogger";

type ActiveTriggerResult =
  | {
      success: true;
      targetInstanceId: number;
      targetCardId: string;
      targetCardName: string;
      amount: number;
    }
  | {
      success: false;
      reason: "noTarget";
    };

type ColorTriggerResult =
  | {
      success: true;
      color: "blue";
      effect: "returnToHand";
      returnedCardInstanceId: number;
      returnedCardId: string;
      returnedCardName: string;
      targetIndex: number;
    }
  | {
      success: true;
      color: "red";
      effect: "destroy";
      destroyedCardInstanceId: number;
      destroyedCardId: string;
      destroyedCardName: string;
      targetIndex: number;
    }
  | {
      success: false;
      color?: string;
      reason: "unsupportedColor" | "noTarget";
    };

type FinalTriggerResult =
  | {
      success: true;
      addedLifeInstanceId: number;
      addedLifeCardId: string;
      addedLifeCardName: string;
    }
  | {
      success: false;
      reason: "lifeExists" | "deckEmpty";
    };

type SpecialTriggerResult = {
  result: "special";
};

export class TriggerAction {
  public static resolve(
    game: Game,
    revealedCard: CardInstance,
    damagedPlayer: Player,
    opponentPlayer: Player
  ): void {
    this.logTriggerReveal(game, revealedCard, damagedPlayer, opponentPlayer);

    switch (revealedCard.card.triggerType) {
      case TriggerType.Draw:
        damagedPlayer.board.draw(1);
        damagedPlayer.board.trash.push(revealedCard);
        this.logTriggerResult(game, damagedPlayer, revealedCard, {
          result: "draw",
          count: 1,
        });
        return;

      case TriggerType.Get:
        damagedPlayer.board.hand.push(revealedCard);
        this.logTriggerResult(game, damagedPlayer, revealedCard, {
          result: "get",
        });
        return;

      case TriggerType.Active: {
        game.pendingTriggerChoice = {
          revealedCard,
          playerId: damagedPlayer.id,
          opponentPlayerId: opponentPlayer.id,
          triggerType: TriggerType.Active,
        };

        this.logTriggerResult(game, damagedPlayer, revealedCard, {
          result: "pendingActiveChoice",
        });

        return;
      }

      case TriggerType.Color: {
        game.pendingTriggerChoice = {
          revealedCard,
          playerId: damagedPlayer.id,
          opponentPlayerId: opponentPlayer.id,
          triggerType: TriggerType.Color,
        };

        this.logTriggerResult(game, damagedPlayer, revealedCard, {
          result: "pendingColorChoice",
          color: revealedCard.card.color,
        });

        return;
      }

      case TriggerType.Special: {
        game.pendingTriggerChoice = {
          revealedCard,
          playerId: damagedPlayer.id,
          opponentPlayerId: opponentPlayer.id,
          triggerType: TriggerType.Special,
        };

        this.logTriggerResult(game, damagedPlayer, revealedCard, {
          result: "pendingSpecialChoice",
        });

        return;
      }

      case TriggerType.Final: {
        const result = this.resolveFinalTrigger(damagedPlayer);
        damagedPlayer.board.trash.push(revealedCard);
        this.logTriggerResult(game, damagedPlayer, revealedCard, {
          result: "final",
          ...result,
        });
        return;
      }

      case TriggerType.Raid:
        this.resolveRaidTrigger(game, revealedCard, damagedPlayer, opponentPlayer);
        return;

      case TriggerType.None:
      default:
        damagedPlayer.board.trash.push(revealedCard);
        this.logTriggerResult(game, damagedPlayer, revealedCard, {
          result: "none",
        });
        return;
    }
  }

  private static logTriggerReveal(
    game: Game,
    revealedCard: CardInstance,
    damagedPlayer: Player,
    opponentPlayer: Player
  ): void {
    GameLogger.add(game, {
      playerId: damagedPlayer.id,
      type: LogType.Trigger,
      message: `${revealedCard.card.name}の${revealedCard.card.triggerType}トリガーを公開`,
      payload: {
        cardInstanceId: revealedCard.instanceId,
        cardId: revealedCard.card.id,
        cardName: revealedCard.card.name,
        triggerType: revealedCard.card.triggerType,
        damagedPlayerId: damagedPlayer.id,
        opponentPlayerId: opponentPlayer.id,
      },
    });
  }

  private static logTriggerResult(
    game: Game,
    player: Player,
    revealedCard: CardInstance,
    resultPayload: Record<string, unknown>
  ): void {
    GameLogger.add(game, {
      playerId: player.id,
      type: LogType.TriggerResult,
      message: `${revealedCard.card.name}のトリガー結果: ${String(
        resultPayload.result
      )}`,
      payload: {
        cardInstanceId: revealedCard.instanceId,
        cardId: revealedCard.card.id,
        cardName: revealedCard.card.name,
        triggerType: revealedCard.card.triggerType,
        ...resultPayload,
      },
    });
  }

  private static resolveActiveTrigger(player: Player): ActiveTriggerResult {
    const targetSlot = player.board.frontLine.find((slot) => {
      const card = slot.getCard();
      return card && card.card instanceof CharacterCard;
    });

    const target = targetSlot?.getCard();

    if (!target) {
      return {
        success: false,
        reason: "noTarget",
      };
    }

    target.temporaryBpBonus += 3000;

    return {
      success: true,
      targetInstanceId: target.instanceId,
      targetCardId: target.card.id,
      targetCardName: target.card.name,
      amount: 3000,
    };
  }

  private static resolveColorTrigger(
    revealedCard: CardInstance,
    damagedPlayer: Player,
    opponentPlayer: Player
  ): ColorTriggerResult {
    if (revealedCard.card.color === "blue") {
      return this.resolveBlueColorTrigger(opponentPlayer);
    }

    if (revealedCard.card.color === "red") {
      return this.resolveRedColorTrigger(opponentPlayer);
    }

    return {
      success: false,
      color: revealedCard.card.color,
      reason: "unsupportedColor",
    };
  }
  private static resolveBlueColorTrigger(
  opponentPlayer: Player
  ): ColorTriggerResult {
    const targetIndex = opponentPlayer.board.frontLine.findIndex((slot) => {
      const card = slot.getCard();

      if (!card || !(card.card instanceof CharacterCard)) {
        return false;
      }

      return card.getCurrentBp() <= 3500;
    });

    if (targetIndex === -1) {
      return {
        success: false,
        color: "blue",
        reason: "noTarget",
      };
    }

    const returned = opponentPlayer.board.frontLine[targetIndex].removeCard();

    if (!returned) {
      return {
        success: false,
        color: "blue",
        reason: "noTarget",
      };
    }

    opponentPlayer.board.hand.push(returned);

    return {
    success: true,
    color: "blue",
    effect: "returnToHand",
    returnedCardInstanceId: returned.instanceId,
    returnedCardId: returned.card.id,
    returnedCardName: returned.card.name,
    targetIndex,
  };
  }
  private static resolveRedColorTrigger(
    opponentPlayer: Player
  ): ColorTriggerResult {
    const targetIndex = opponentPlayer.board.frontLine.findIndex((slot) => {
      const card = slot.getCard();

      if (!card || !(card.card instanceof CharacterCard)) {
        return false;
      }

      return card.getCurrentBp() <= 2500;
    });

    if (targetIndex === -1) {
      return {
        success: false,
        color: "red",
        reason: "noTarget",
      };
    }

    const destroyed = opponentPlayer.board.frontLine[targetIndex].removeCard();

    if (!destroyed) {
      return {
        success: false,
        color: "red",
        reason: "noTarget",
      };
    }

    opponentPlayer.board.trash.push(destroyed);

    return {
    success: true,
    color: "red",
    effect: "destroy",
    destroyedCardInstanceId: destroyed.instanceId,
    destroyedCardId: destroyed.card.id,
    destroyedCardName: destroyed.card.name,
    targetIndex,
  };
  }
  private static resolveFinalTrigger(player: Player): FinalTriggerResult {
    if (player.board.lifeArea.length > 0) {
      return {
        success: false,
        reason: "lifeExists",
      };
    }

    const lifeCard = player.board.deck.pop();

    if (!lifeCard) {
      return {
        success: false,
        reason: "deckEmpty",
      };
    }

    player.board.lifeArea.push(lifeCard);

    return {
      success: true,
      addedLifeInstanceId: lifeCard.instanceId,
      addedLifeCardId: lifeCard.card.id,
      addedLifeCardName: lifeCard.card.name,
    };
  }

  private static resolveSpecialTrigger(
    game: Game,
    revealedCard: CardInstance,
    damagedPlayer: Player,
    opponentPlayer: Player
  ): SpecialTriggerResult {
    const context: EffectContext = {
      game,
      source: revealedCard,
      actor: damagedPlayer,
      opponent: opponentPlayer,
    };

    const action: EffectAction = {
      type: "destroy",
      target: {
        side: "opponent",
        zone: "frontLine",
        cardType: "character",
        maxCount: 1,
      },
    };

    DestroyEffectAction.execute(context, action);

    return {
      result: "special",
    };
  }

  private static resolveRaidTrigger(
    game: Game,
    revealedCard: CardInstance,
    damagedPlayer: Player,
    opponentPlayer: Player
  ): void {
    const board = damagedPlayer.board;

    const canPayEnergy = board
      .getGeneratedEnergy()
      .canPay(revealedCard.card.requiredEnergy);

    if (!canPayEnergy || revealedCard.card.raidConditions.length === 0) {
      board.hand.push(revealedCard);
      this.logTriggerResult(game, damagedPlayer, revealedCard, {
        result: "addToHand",
        reason: !canPayEnergy ? "notEnoughEnergy" : "noRaidConditions",
      });
      return;
    }

    const hasRaidBase = [...board.frontLine, ...board.energyLine].some((slot) => {
      const base = slot.getCard();
      return (
        base &&
        RaidConditionResolver.canRaidOn(revealedCard.card.raidConditions, base)
      );
    });

    if (!hasRaidBase) {
      board.hand.push(revealedCard);
      this.logTriggerResult(game, damagedPlayer, revealedCard, {
        result: "addToHand",
        reason: "noRaidBase",
      });
      return;
    }

    game.pendingRaidTrigger = {
      revealedCard,
      playerId: damagedPlayer.id,
      opponentPlayerId: opponentPlayer.id,
    };

    this.logTriggerResult(game, damagedPlayer, revealedCard, {
      result: "pendingRaidChoice",
    });
  }
}