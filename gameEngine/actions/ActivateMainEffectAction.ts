import { Game } from "../core/Game";
import { GamePhase } from "../enum/GamePhase";
import { BoardLine } from "../enum/BoardLine";
import { EffectTrigger } from "../effects/EffectTrigger";
import { EffectResolver } from "../effects/EffectResolver";
import { CardInstance } from "../cards/CardInstance";

export class ActivateMainEffectAction {
  public static execute(
    game: Game,
    sourceLine: BoardLine,
    sourceIndex: number,
    targetLine?: BoardLine,
    targetIndex?: number,
    options?: {
      skipCosts?: boolean;
    }
  ): void {
    if (game.phase !== GamePhase.Main) {
      throw new Error("Activate main effect is only allowed in main phase.");
    }

    const player = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    const sourceSlot = this.getSlot(player.board, sourceLine, sourceIndex);
    const source = sourceSlot?.getCard();

    if (!source) {
      throw new Error("Source card not found.");
    }

    const target =
      targetLine !== undefined && targetIndex !== undefined
        ? this.getSlot(player.board, targetLine, targetIndex)?.getCard()
        : undefined;

    EffectResolver.resolve(
      game,
      source,
      EffectTrigger.ActivateMain,
      player,
      opponent,
      {
        target,
        skipCosts: options?.skipCosts,
      }
    );
  }

  private static getSlot(
    board: {
      frontLine: { getCard(): CardInstance | undefined }[];
      energyLine: { getCard(): CardInstance | undefined }[];
    },
    line: BoardLine,
    index: number
  ) {
    if (index < 0 || index >= 4) {
      return undefined;
    }

    return line === BoardLine.FrontLine
      ? board.frontLine[index]
      : board.energyLine[index];
  }
}