import { Game } from "../core/Game";
import { GamePhase } from "../enum/GamePhase";
import { BoardLine } from "../enum/BoardLine";
import { EffectTrigger } from "../effects/EffectTrigger";
import { EffectCost } from "../effects/EffectCost";
import { EffectAction } from "../effects/EffectAction";
import { CardInstance } from "../cards/CardInstance";

export class ActivateMainEffectAction {
  public static execute(
    game: Game,
    sourceLine: BoardLine,
    sourceIndex: number,
    targetLine: BoardLine,
    targetIndex: number
  ): void {
    if (game.phase !== GamePhase.Main) {
      throw new Error("Activate main effect is only allowed in main phase.");
    }

    const player = game.getCurrentPlayer();
    const sourceSlot = this.getSlot(player.board, sourceLine, sourceIndex);
    const targetSlot = this.getSlot(player.board, targetLine, targetIndex);

    const source = sourceSlot?.getCard();
    const target = targetSlot?.getCard();

    if (!source) {
      throw new Error("Source card not found.");
    }

    if (!target) {
      throw new Error("Target card not found.");
    }

    if (source === target) {
      throw new Error("Cannot target self.");
    }

    const effect = source.card.effects.find(
      (effect) => effect.trigger === EffectTrigger.ActivateMain
    );

    if (!effect) {
      throw new Error("Activate main effect not found.");
    }

    this.payCosts(source, effect.costs ?? []);
    this.executeActions(source, target, effect.actions);
  }

  private static payCosts(source: CardInstance, costs: EffectCost[]): void {
    for (const cost of costs) {
      switch (cost.type) {
        case "restSelf":
          if (source.isRest) {
            throw new Error("Rested card cannot pay restSelf cost.");
          }

          source.isRest = true;
          break;

        default:
          throw new Error(`Unknown effect cost: ${(cost as any).type}`);
      }
    }
  }

  private static executeActions(
    source: CardInstance,
    target: CardInstance,
    actions: EffectAction[]
  ): void {
    for (const action of actions) {
      switch (action.type) {
        case "modifyBpThisTurn":
          if (action.target !== "selectedOwnOtherCharacter") {
            throw new Error(
              `Unsupported modifyBpThisTurn target: ${action.target}`
            );
          }

          target.temporaryBpBonus += action.amount;
          break;

        default:
          throw new Error(`Unsupported activate main action: ${(action as any).type}`);
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
    if (index < 0 || index >= 4) {
      return undefined;
    }

    if (line === BoardLine.FrontLine) {
      return board.frontLine[index];
    }

    if (line === BoardLine.EnergyLine) {
      return board.energyLine[index];
    }

    return undefined;
  }
}