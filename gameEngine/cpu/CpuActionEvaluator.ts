import { Game } from "../core/Game";
import { BoardLine } from "../enum/BoardLine";
import { CpuAction } from "./CpuAction";

export class CpuActionEvaluator {
  public static score(game: Game, action: CpuAction): number {
    const player = game.getCurrentPlayer();

    switch (action.type) {
      case "attack": {
        if (action.attackTarget?.type === "frontLineCharacter") {
          return 85;
        }

        return 100;
      }

      case "raidPlay": {
        return 120;
      }

      case "playCard": {
        const card = player.board.hand[action.handIndex];

        if (!card) {
          return -1000;
        }

        if (action.destination === BoardLine.FrontLine) {
          const bp =
            "bp" in card.card &&
            typeof card.card.bp === "number"
              ? card.card.bp
              : undefined;

          return 75 + this.getBpBonus(bp);
        }

        if (action.destination === BoardLine.EnergyLine) {
          return this.shouldPrioritizeEnergy(game) ? 90 : 45;
        }

        return 40;
      }

      case "useEvent": {
        return 60;
      }

      case "activateMain": {
        return 70;
      }

      case "move": {
        if (
          action.fromLine === BoardLine.EnergyLine &&
          action.toLine === BoardLine.FrontLine
        ) {
          if (this.shouldKeepRequiredEnergy(game)) {
            return -100;
          }
          return 65;
        }

        if (
          action.fromLine === BoardLine.FrontLine &&
          action.toLine === BoardLine.EnergyLine
        ) {
          return 20;
        }

        return 30;
      }

      case "endPhase": {
        return 0;
      }

      default:
        return 0;
    }
  }
  private static getTargetEnergyCount(game: Game): number {
    const player = game.getCurrentPlayer();

    const requiredEnergyTotals = player.board.hand.map(
      (card) => card.card.requiredEnergy.getTotal()
    );

    if (requiredEnergyTotals.length === 0) {
      return 2;
    }

    const highestRequiredEnergy = Math.max(...requiredEnergyTotals);

    // 現在の盤面ではエナジーライン最大4枚なので上限4
    return Math.min(highestRequiredEnergy, 4);
  }
  private static shouldPrioritizeEnergy(game: Game): boolean {
    const player = game.getCurrentPlayer();

    const currentEnergyCount = player.board.energyLine.filter(
      (slot) => !slot.isEmpty()
    ).length;

    const targetEnergyCount = this.getTargetEnergyCount(game);

    return currentEnergyCount < targetEnergyCount;
  }

  private static getBpBonus(bp?: number): number {
    if (!bp) return 0;

    if (bp >= 4000) return 20;
    if (bp >= 3000) return 12;
    if (bp >= 2000) return 6;

    return 0;
  }
  private static shouldKeepRequiredEnergy(game: Game): boolean {
    const player = game.getCurrentPlayer();

    const energyCount = player.board.energyLine.filter(
      (slot) => !slot.isEmpty()
    ).length;

    const targetEnergyCount = this.getTargetEnergyCount(game);

    return energyCount <= targetEnergyCount;
  }
}