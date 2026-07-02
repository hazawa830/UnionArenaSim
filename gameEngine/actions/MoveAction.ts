import { Game } from "../core/Game";
import { Board } from "../core/Board";
import { Slot } from "../models/Slot";
import { BoardLine } from "../enum/BoardLine";
import { GamePhase } from "../enum/GamePhase";
import { ActionSource } from "../enum/ActionSource";

export class MoveCardAction {
  public static execute(
    game: Game,
    fromLine: BoardLine,
    fromIndex: number,
    toLine: BoardLine,
    toIndex: number,
    source: ActionSource = ActionSource.PlayerNormal
  ): void {
    if (source === ActionSource.PlayerNormal && game.phase !== GamePhase.Move) {
      throw new Error("Normal move is only allowed in move phase.");
    }

    const board = game.getCurrentPlayer().board;

    const fromSlot = this.getSlot(board, fromLine, fromIndex);
    const toSlot = this.getSlot(board, toLine, toIndex);

    if (!fromSlot) {
      throw new Error(`Invalid from slot. line=${fromLine}, index=${fromIndex}`);
    }

    if (!toSlot) {
      throw new Error(`Invalid to slot. line=${toLine}, index=${toIndex}`);
    }

    const movingCard = fromSlot.getCard();

    if (!movingCard) {
      throw new Error("Source slot is empty.");
    }

    if (!toSlot.isEmpty()) {
      throw new Error("Destination slot is not empty.");
    }

    this.validateMove(fromLine, toLine, movingCard.card.hasKeyword("step"));

    const card = fromSlot.removeCard();

    if (!card) {
      throw new Error("Failed to remove card from source slot.");
    }

    toSlot.setCard(card);
  }

  private static validateMove(
    fromLine: BoardLine,
    toLine: BoardLine,
    hasStep: boolean
  ): void {
    const isEnergyToFront =
      fromLine === BoardLine.EnergyLine && toLine === BoardLine.FrontLine;

    const isFrontToEnergy =
      fromLine === BoardLine.FrontLine && toLine === BoardLine.EnergyLine;

    if (isEnergyToFront) {
      return;
    }

    if (isFrontToEnergy && hasStep) {
      return;
    }

    if (isFrontToEnergy && !hasStep) {
      throw new Error("Only step characters can move from front line to energy line.");
    }

    throw new Error("Invalid move.");
  }

  private static getSlot(
    board: Board,
    line: BoardLine,
    index: number
  ): Slot | undefined {
    if (index < 0 || index >= 4) {
      return undefined;
    }

    if (line === BoardLine.FrontLine) {
      return board.frontLine[index];
    }

    return board.energyLine[index];
  }
}