import { Game } from "../core/Game";
import { BoardLine } from "../enum/BoardLine";
import { EffectResolver } from "../effects/EffectResolver";
import { EffectTrigger } from "../effects/EffectTrigger";
import { RaidConditionResolver } from "../raid/RaidConditionResolver";
import { GameLogger } from "../log/GameLogger";
import { LogType } from "../enum/LogType";
import { CardInstance } from "../cards/CardInstance";
export class ResolveRaidTriggerAction {
  public static execute(
    game: Game,
    useRaid: boolean,
    baseLine?: BoardLine,
    baseIndex?: number,
    destinationLine: BoardLine = BoardLine.EnergyLine,
    destinationIndex?: number,
    options?: {
      skipPlayFromHand?: boolean;
    }
  ): CardInstance | undefined {
    const pending = game.pendingRaidTrigger;

    if (!pending) {
      throw new Error("No pending raid trigger.");
    }

    const damagedPlayer =
      game.player1.id === pending.playerId ? game.player1 : game.player2;

    const opponentPlayer =
      game.player1.id === pending.opponentPlayerId ? game.player1 : game.player2;

    const board = damagedPlayer.board;
    const raidCard = pending.revealedCard;

    if (!useRaid) {
      board.hand.push(raidCard);
      game.pendingRaidTrigger = undefined;

      GameLogger.add(game, {
        playerId: damagedPlayer.id,
        type: LogType.TriggerResult,
        message: `${raidCard.card.name}を手札に加えた`,
        payload: {
          result: "addToHand",
          reason: "declinedRaid",
          cardInstanceId: raidCard.instanceId,
          cardId: raidCard.card.id,
          cardName: raidCard.card.name,
        },
      });

      return;
    }

    if (baseLine === undefined || baseIndex === undefined) {
      throw new Error("Raid base is required.");
    }

    const baseSlot =
      baseLine === BoardLine.FrontLine
        ? board.frontLine[baseIndex]
        : board.energyLine[baseIndex];

    const baseCard = baseSlot?.getCard();

    if (!baseSlot || !baseCard) {
      throw new Error("Raid base not found.");
    }
    if (baseCard.raidBase) {
      throw new Error("すでにレイドしているキャラクターにはレイドできません");
    }
    if (
      !RaidConditionResolver.canRaidOn(raidCard.card.raidConditions, baseCard)
    ) {
      throw new Error("Raid condition is not satisfied.");
    }

    const destinationSlot =
      baseLine === BoardLine.FrontLine
        ? baseSlot
        : destinationLine === BoardLine.EnergyLine
          ? baseSlot
          : board.frontLine[destinationIndex ?? -1];

    if (!destinationSlot) {
      throw new Error("Invalid raid destination.");
    }

    if (
      baseLine === BoardLine.EnergyLine &&
      destinationLine === BoardLine.FrontLine &&
      !destinationSlot.isEmpty()
    ) {
      throw new Error("Raid destination slot is not empty.");
    }

    const removedBase = baseSlot.removeCard();

    if (!removedBase) {
      throw new Error("Failed to remove raid base.");
    }

    raidCard.raidBase = removedBase;
    raidCard.isRest = false;

    destinationSlot.setCard(raidCard);

    game.pendingRaidTrigger = undefined;

    GameLogger.add(game, {
      playerId: damagedPlayer.id,
      type: LogType.TriggerResult,
      message: `${raidCard.card.name}をトリガーでレイド登場`,
      payload: {
        result: "raidPlay",
        raidInstanceId: raidCard.instanceId,
        raidCardId: raidCard.card.id,
        raidCardName: raidCard.card.name,
        baseInstanceId: removedBase.instanceId,
        baseCardId: removedBase.card.id,
        baseCardName: removedBase.card.name,
        baseLine,
        baseIndex,
        destinationLine,
        destinationIndex:
          destinationLine === BoardLine.EnergyLine ? baseIndex : destinationIndex,
      },
    });

    EffectResolver.resolve(
      game,
      raidCard,
      EffectTrigger.OnPlay,
      damagedPlayer,
      opponentPlayer,
      {
        skipPlayFromHand: options?.skipPlayFromHand,
      }
    )
    return raidCard;
  }
}