import { Game } from "../core/Game";
import { CpuActionGenerator } from "./CpuActionGenerator";
import { CpuActionExecutor } from "./CpuActionExecutor";


import { ResolveTriggerChoiceAction } from "../actions/ResolveTriggerChoiceAction";
import { ResolveRaidTriggerAction } from "../actions/ResolveRaidTriggerAction";
import { BoardLine } from "../enum/BoardLine";
import { TriggerType } from "../enum/TriggerType";
import { RaidConditionResolver } from "../raid/RaidConditionResolver";

export class RandomCPU {
  public static playPhase(game: Game): void {
    if (game.winner) {
      return;
    }

    const actions = CpuActionGenerator.generate(game);

    if (actions.length === 0) {
      return;
    }

    const shuffled = this.shuffle(actions);

    for (const action of shuffled) {
      if (CpuActionExecutor.tryExecute(game, action)) {
        return;
      }
    }
  }

  private static shuffle<T>(items: T[]): T[] {
    return [...items].sort(() => Math.random() - 0.5);
  }
  public static resolvePendingChoices(game: Game): boolean {
  if (game.pendingTriggerChoice) {
    const pending = game.pendingTriggerChoice;

    const actor =
      game.player1.id === pending.playerId ? game.player1 : game.player2;

    const opponent =
      game.player1.id === pending.opponentPlayerId ? game.player1 : game.player2;

    if (pending.triggerType === TriggerType.Active) {
      const target = actor.board.frontLine
        .map((slot) => slot.getCard())
        .find((card) => card !== undefined);

      if (target) {
        ResolveTriggerChoiceAction.execute(game, [target]);
        return true;
      }
    }

    if (pending.triggerType === TriggerType.Special) {
      const target = opponent.board.frontLine
        .map((slot) => slot.getCard())
        .find((card) => card !== undefined);

      if (target) {
        ResolveTriggerChoiceAction.execute(game, [target]);
        return true;
      }
    }

    return false;
  }

  if (game.pendingRaidTrigger) {
    const pending = game.pendingRaidTrigger;

    const player =
      game.player1.id === pending.playerId ? game.player1 : game.player2;

    const raidCard = pending.revealedCard;

    for (let i = 0; i < player.board.frontLine.length; i++) {
      const base = player.board.frontLine[i].getCard();

      if (
        base &&
        RaidConditionResolver.canRaidOn(raidCard.card.raidConditions, base)
      ) {
        ResolveRaidTriggerAction.execute(
          game,
          true,
          BoardLine.FrontLine,
          i,
          BoardLine.FrontLine
        );
        return true;
      }
    }

    for (let i = 0; i < player.board.energyLine.length; i++) {
      const base = player.board.energyLine[i].getCard();

      if (
        base &&
        RaidConditionResolver.canRaidOn(raidCard.card.raidConditions, base)
      ) {
        ResolveRaidTriggerAction.execute(
          game,
          true,
          BoardLine.EnergyLine,
          i,
          BoardLine.EnergyLine,
          i
        );
        return true;
      }
    }

    ResolveRaidTriggerAction.execute(game, false);
    return true;
  }

  return false;
}
}