import { Game } from "../core/Game";
import { CpuAction } from "./CpuAction";

import { MoveCardAction } from "../actions/MoveAction";
import { PlayCardAction } from "../actions/PlayCardAction";
import { UseEventCardAction } from "../actions/UseEventCardAction";
import { RaidPlayAction } from "../actions/RaidPlayAction";
import { ActivateMainEffectAction } from "../actions/ActivateMainEffectAction";
import { AttackAction } from "../actions/AttackAction";
import { TurnManager } from "../rules/TurnManager";

export class CpuActionExecutor {
  public static execute(game: Game, action: CpuAction): void {
    switch (action.type) {
      case "move":
        MoveCardAction.execute(
          game,
          action.fromLine,
          action.fromIndex,
          action.toLine,
          action.toIndex
        );
        return;

      case "playCard":
        PlayCardAction.execute(
          game,
          action.handIndex,
          action.destination
        );
        return;

      case "useEvent":
        UseEventCardAction.execute(
          game,
          action.handIndex
        );
        return;

      case "raidPlay":
        RaidPlayAction.execute(
          game,
          action.handIndex,
          action.baseLine,
          action.baseIndex,
          action.destinationFrontIndex
        );
        return;

      case "activateMain":
        ActivateMainEffectAction.execute(
          game,
          action.sourceLine,
          action.sourceIndex,
          action.targetLine,
          action.targetIndex
        );
        return;

      case "attack":
        AttackAction.execute(
          game,
          action.attackerIndex,
          action.blockerIndex,
          undefined,
          action.attackTarget ?? { type: "player" }
        );
        return;

      case "endPhase":
        TurnManager.nextPhase(game);
        return;

      default:
        throw new Error(`Unknown CPU action: ${(action as any).type}`);
    }
  }

  public static tryExecute(game: Game, action: CpuAction): boolean {
    try {
      this.execute(game, action);
      return true;
    } catch {
      return false;
    }
  }
}