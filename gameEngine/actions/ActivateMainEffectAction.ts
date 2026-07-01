import { Game } from "../core/Game";
import { GamePhase } from "../enum/GamePhase";
import { BoardLine } from "../enum/BoardLine";
import { EffectTrigger } from "../effects/EffectTrigger";
import { EffectAction } from "../effects/EffectAction";
import { EffectCostExecutor } from "../effects/EffectCostExecutor";
import { EffectContext } from "../effects/EffectContext";
import { CardInstance } from "../cards/CardInstance";

export class ActivateMainEffectAction {
  public static execute(
    game: Game,
    sourceLine: BoardLine,
    sourceIndex: number,
    targetLine?: BoardLine,
    targetIndex?: number
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

    if (!source) throw new Error("Source card not found.");
    
    if (source === target) throw new Error("Cannot target self.");

    const effect = source.card.effects.find(
      (effect) => effect.trigger === EffectTrigger.ActivateMain
    );

    if (!effect) {
      throw new Error("Activate main effect not found.");
    }

    const context: EffectContext = {
      game,
      source,
      actor: player,
      opponent,
    };

    EffectCostExecutor.payCosts(context, effect.costs);

    this.executeActions(source, target, effect.actions);
  }

  private static executeActions(
  source: CardInstance,
  target: CardInstance | undefined,
  actions: EffectAction[]
): void {
  for (const action of actions) {
    switch (action.type) {
      case "modifyBpThisTurn":
        if (action.target === "self") {
          source.temporaryBpBonus += action.amount;
          break;
        }

        if (action.target === "selectedOwnOtherCharacter") {
          if (!target) {
            throw new Error("Target card not found.");
          }

          if (source === target) {
            throw new Error("Cannot target self.");
          }

          target.temporaryBpBonus += action.amount;
          break;
        }

        throw new Error(
          `Unsupported modifyBpThisTurn target: ${JSON.stringify(action.target)}`
        );

      default:
        throw new Error(
          `Unsupported activate main action: ${(action as any).type}`
        );
    }
  }
}

  private static getSlot(
    board: {
      frontLine: { getCard(): CardInstance | undefined }[];
      energyLine: { getCard(): CardInstance | undefined }[];
    },
    line: BoardLine,
    index: number
  ) {
    if (index < 0 || index >= 4) return undefined;

    return line === BoardLine.FrontLine
      ? board.frontLine[index]
      : board.energyLine[index];
  }
}