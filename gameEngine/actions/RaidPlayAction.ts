import { Game } from "../core/Game";
import { Board } from "../core/Board";
import { Slot } from "../models/Slot";
import { CardInstance } from "../cards/CardInstance";

import { BoardLine } from "../enum/BoardLine";
import { GamePhase } from "../enum/GamePhase";
import { CardType } from "../enum/CardType";
import { EffectTrigger } from "../effects/EffectTrigger";
import { EffectResolver } from "../effects/EffectResolver";

import { RaidConditionResolver } from "../raid/RaidConditionResolver";
import { LogType } from "../enum/LogType";
import { GameLogger } from "../log/GameLogger";

export class RaidPlayAction {
  public static execute(
    game: Game,
    handIndex: number,
    baseLine: BoardLine,
    baseIndex: number,
    destinationIndex?: number,
    destinationLine: BoardLine = BoardLine.FrontLine
  ): void {
    if (game.phase !== GamePhase.Main) {
      throw new Error("Raid play is only allowed in main phase.");
    }

    const player = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();
    const board = player.board;

    const raidCard = board.hand[handIndex];

    if (!raidCard) {
      throw new Error(`Hand card not found. handIndex=${handIndex}`);
    }

    if (raidCard.card.cardType !== CardType.Character) {
      throw new Error("Only character cards can raid.");
    }

    if (raidCard.card.raidConditions.length === 0) {
      throw new Error("Selected card does not have raid conditions.");
    }

    const baseSlot = this.getSlot(board, baseLine, baseIndex);

    if (!baseSlot) {
      throw new Error(`Invalid raid base slot. line=${baseLine}, index=${baseIndex}`);
    }

    const baseCard = baseSlot.getCard();
    const destinationSlot =
    baseLine === BoardLine.FrontLine
      ? baseSlot
      : destinationLine === BoardLine.EnergyLine
        ? baseSlot
        : this.getSlot(board, BoardLine.FrontLine, destinationIndex ?? -1);

    if (!destinationSlot) {
    throw new Error("Invalid raid destination slot.");
    }

    if (
      baseLine === BoardLine.EnergyLine &&
      destinationLine === BoardLine.FrontLine &&
      !destinationSlot.isEmpty()
    ) {
      throw new Error("Raid destination slot is not empty.");
    }
    if (!baseCard) {
      throw new Error("Raid base slot is empty.");
    }

    if (
      !RaidConditionResolver.canRaidOn(
        raidCard.card.raidConditions,
        baseCard
      )
    ) {
      throw new Error("Raid condition is not satisfied.");
    }

    const canPayEnergy = board
      .getGeneratedEnergy()
      .canPay(raidCard.card.requiredEnergy);

    if (!canPayEnergy) {
      throw new Error("Not enough energy.");
    }

    if (board.activeActionPoint < raidCard.card.actionPointCost) {
      throw new Error("Not enough action points.");
    }

    board.payActionPoint(raidCard.card.actionPointCost);

    board.hand.splice(handIndex, 1);

    const removedBase = baseSlot.removeCard();

    if (!removedBase) {
      throw new Error("Failed to remove raid base.");
    }

    raidCard.raidBase = removedBase;
    raidCard.isRest = false;

    destinationSlot.setCard(raidCard);
    const movedFromEnergy =
    baseLine === BoardLine.EnergyLine &&
    destinationLine === BoardLine.FrontLine;

GameLogger.add(game, {
  playerId: player.id,
  type: LogType.RaidPlay,
  message: `${raidCard.card.name}を${removedBase.card.name}の上にレイド登場`,
  payload: {
    raidInstanceId: raidCard.instanceId,
    raidCardId: raidCard.card.id,
    raidCardName: raidCard.card.name,

    baseInstanceId: removedBase.instanceId,
    baseCardId: removedBase.card.id,
    baseCardName: removedBase.card.name,

    handIndex,
    baseLine,
    baseIndex,
    destinationLine,
    destinationIndex:
      destinationLine === BoardLine.EnergyLine
        ? baseIndex
        : destinationIndex,
    movedFromEnergy,

    actionPointCost: raidCard.card.actionPointCost,
    isRest: raidCard.isRest,
  },
});
    EffectResolver.resolve(
      game,
      raidCard,
      EffectTrigger.OnPlay,
      player,
      opponent
    );
  }

  private static getSlot(
    board: Board,
    line: BoardLine,
    index: number
  ): Slot | undefined {
    if (index < 0 || index >= 4) {
      return undefined;
    }

    return line === BoardLine.FrontLine
      ? board.frontLine[index]
      : board.energyLine[index];
  }
}