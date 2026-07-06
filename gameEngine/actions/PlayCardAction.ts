import { Game } from "../core/Game";
import { Board } from "../core/Board";
import { Slot } from "../models/Slot";
import { GamePhase } from "../enum/GamePhase";
import { BoardLine } from "../enum/BoardLine";
import { ActionSource } from "../enum/ActionSource";
import { LogType } from "../enum/LogType";
import { EffectResolver } from "../effects/EffectResolver";
import { EffectTrigger } from "../effects/EffectTrigger";
import { GameLogger } from "../log/GameLogger";
import { CardInstance } from "../cards/CardInstance";

export class PlayCardAction {
  public static execute(
    game: Game,
    handIndex: number,
    destination: BoardLine,
    source: ActionSource = ActionSource.PlayerNormal
  ): CardInstance {
    if (source === ActionSource.PlayerNormal && game.phase !== GamePhase.Main) {
      throw new Error("Normal play is only allowed in main phase.");
    }

    const player = game.getCurrentPlayer();
    const board = player.board;

    const cardInstance = board.hand[handIndex];

    if (!cardInstance) {
      throw new Error(`Hand card not found. handIndex=${handIndex}`);
    }

    const targetSlot = this.getTargetSlot(board, destination);

    if (!targetSlot) {
      throw new Error(`No empty slot in ${destination}.`);
    }

    const totalEnergy = board.getGeneratedEnergy();

    if (!totalEnergy.canPay(cardInstance.card.requiredEnergy)) {
      throw new Error("Not enough energy.");
    }

    board.payActionPoint(cardInstance.card.actionPointCost);

    if (source === ActionSource.PlayerNormal) {
      cardInstance.isRest = true;
    }

    board.hand.splice(handIndex, 1);
    targetSlot.setCard(cardInstance);

    GameLogger.add(game, {
      playerId: player.id,
      type: LogType.PlayCard,
      message: `${cardInstance.card.name}を${destination}へ登場`,
      payload: {
        instanceId: cardInstance.instanceId,
        cardId: cardInstance.card.id,
        cardName: cardInstance.card.name,
        destination,
        source,
        actionPointCost: cardInstance.card.actionPointCost,
        requiredEnergy: cardInstance.card.requiredEnergy,
        isRest: cardInstance.isRest,
      },
    });

    EffectResolver.resolve(game, cardInstance, EffectTrigger.OnPlay);
    return cardInstance;
  }

  private static getTargetSlot(
    board: Board,
    destination: BoardLine
  ): Slot | undefined {
    if (destination === BoardLine.FrontLine) {
      return board.getEmptyFrontSlot();
    }

    return board.getEmptyEnergySlot();
  }
}