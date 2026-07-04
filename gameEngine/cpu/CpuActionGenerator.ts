import { Game } from "../core/Game";
import { GamePhase } from "../enum/GamePhase";
import { BoardLine } from "../enum/BoardLine";
import { CardType } from "../enum/CardType";
import { CpuAction } from "./CpuAction";

export class CpuActionGenerator {
  public static generate(game: Game): CpuAction[] {
    switch (game.phase) {
      case GamePhase.Move:
        return this.generateMoveActions(game);

      case GamePhase.Main:
        return this.generateMainActions(game);

      case GamePhase.Attack:
        return this.generateAttackActions(game);

      default:
        return [{ type: "endPhase" }];
    }
  }

  private static generateMoveActions(game: Game): CpuAction[] {
    const player = game.getCurrentPlayer();
    const actions: CpuAction[] = [{ type: "endPhase" }];

    for (let fromIndex = 0; fromIndex < 4; fromIndex++) {
      const fromCard = player.board.energyLine[fromIndex].getCard();
      if (!fromCard) continue;

      for (let toIndex = 0; toIndex < 4; toIndex++) {
        if (!player.board.frontLine[toIndex].isEmpty()) continue;

        actions.push({
          type: "move",
          fromLine: BoardLine.EnergyLine,
          fromIndex,
          toLine: BoardLine.FrontLine,
          toIndex,
        });
      }
    }

    for (let fromIndex = 0; fromIndex < 4; fromIndex++) {
      const fromCard = player.board.frontLine[fromIndex].getCard();
      if (!fromCard) continue;
      if (!fromCard.card.hasKeyword("step")) continue;

      for (let toIndex = 0; toIndex < 4; toIndex++) {
        if (!player.board.energyLine[toIndex].isEmpty()) continue;

        actions.push({
          type: "move",
          fromLine: BoardLine.FrontLine,
          fromIndex,
          toLine: BoardLine.EnergyLine,
          toIndex,
        });
      }
    }

    return actions;
  }

  private static generateMainActions(game: Game): CpuAction[] {
    const player = game.getCurrentPlayer();
    const actions: CpuAction[] = [{ type: "endPhase" }];

    for (let handIndex = 0; handIndex < player.board.hand.length; handIndex++) {
      const card = player.board.hand[handIndex];

      if (card.card.cardType === CardType.Event) {
        actions.push({
          type: "useEvent",
          handIndex,
        });
        continue;
      }

      if (card.card.cardType === CardType.Character) {
        for (const destination of [BoardLine.FrontLine, BoardLine.EnergyLine]) {
          actions.push({
            type: "playCard",
            handIndex,
            destination,
          });
        }

        if (card.card.raidConditions.length > 0) {
          this.addRaidActions(game, actions, handIndex);
        }
      }
    }

    return actions;
  }

  private static addRaidActions(
    game: Game,
    actions: CpuAction[],
    handIndex: number
  ): void {
    const player = game.getCurrentPlayer();

    for (let baseIndex = 0; baseIndex < 4; baseIndex++) {
      const frontBase = player.board.frontLine[baseIndex].getCard();

      if (frontBase) {
        actions.push({
          type: "raidPlay",
          handIndex,
          baseLine: BoardLine.FrontLine,
          baseIndex,
        });
      }

      const energyBase = player.board.energyLine[baseIndex].getCard();

      if (energyBase) {
        for (let destinationFrontIndex = 0; destinationFrontIndex < 4; destinationFrontIndex++) {
          if (!player.board.frontLine[destinationFrontIndex].isEmpty()) continue;

          actions.push({
            type: "raidPlay",
            handIndex,
            baseLine: BoardLine.EnergyLine,
            baseIndex,
            destinationFrontIndex,
          });
        }
      }
    }
  }

  private static generateAttackActions(game: Game): CpuAction[] {
    const player = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    const actions: CpuAction[] = [{ type: "endPhase" }];

    for (let attackerIndex = 0; attackerIndex < 4; attackerIndex++) {
      const attacker = player.board.frontLine[attackerIndex].getCard();

      if (!attacker) continue;
      if (attacker.isRest) continue;
      if (attacker.card.cardType !== CardType.Character) continue;

      actions.push({
        type: "attack",
        attackerIndex,
        attackTarget: { type: "player" },
      });

      if (attacker.card.hasKeyword("snipe")) {
        for (let targetIndex = 0; targetIndex < 4; targetIndex++) {
          if (opponent.board.frontLine[targetIndex].isEmpty()) continue;

          actions.push({
            type: "attack",
            attackerIndex,
            attackTarget: {
              type: "frontLineCharacter",
              index: targetIndex,
            },
          });
        }
      }
    }

    return actions;
  }
}