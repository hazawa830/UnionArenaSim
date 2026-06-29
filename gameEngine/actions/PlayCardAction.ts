import { Game } from "../core/Game";
import { Board } from "../core/Board";
import { Slot } from "../models/Slot";
import { GamePhase } from "../enum/GamePhase";
import { BoardLine } from "../enum/BoardLine";
import { ActionSource } from "../enum/ActionSource";

export class PlayCardAction {
  public static execute(
    game: Game,
    handIndex: number,
    destination: BoardLine,
    source: ActionSource = ActionSource.PlayerNormal
  ): void {
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