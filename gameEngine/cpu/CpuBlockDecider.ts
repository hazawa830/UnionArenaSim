import { Game } from "../core/Game";
import { Player } from "../core/Player";
import { CardType } from "../enum/CardType";

export class CpuBlockDecider {
  public static chooseBlockerIndex(
    game: Game,
    attackerPlayerId: string,
    defenderPlayerId: string,
    attackerIndex: number
  ): number | null {
    const attackerPlayer = this.getPlayer(game, attackerPlayerId);
    const defenderPlayer = this.getPlayer(game, defenderPlayerId);

    const attacker =
      attackerPlayer.board.frontLine[attackerIndex]?.getCard();

    if (!attacker) {
      return null;
    }

    if (attacker.card.cardType !== CardType.Character) {
      return null;
    }

    const attackerBp = attacker.getCurrentBp();

    let safeBlockerIndex: number | null = null;
    let safeBlockerBp = Number.POSITIVE_INFINITY;

    let emergencyBlockerIndex: number | null = null;
    let emergencyBlockerBp = Number.POSITIVE_INFINITY;

    for (let index = 0; index < defenderPlayer.board.frontLine.length; index++) {
      const blocker = defenderPlayer.board.frontLine[index].getCard();

      if (!blocker) continue;
      if (blocker.isRest) continue;
      if (blocker.card.cardType !== CardType.Character) continue;

      const blockerBp = blocker.getCurrentBp();

      if (
        attacker.cannotBeBlockedByMinBp !== undefined &&
        blockerBp >= attacker.cannotBeBlockedByMinBp
      ) {
        continue;
      }

      /*
       * 相手BP以上なら、失わずに守れる候補。
       * 条件を満たす中で最もBPが低いカードを使う。
       */
      if (blockerBp > attackerBp) {
        if (blockerBp < safeBlockerBp) {
          safeBlockerIndex = index;
          safeBlockerBp = blockerBp;
        }

        continue;
      }

      /*
       * 負けブロック用。
       * ライフが少ないとき、最もBPが低いカードを犠牲にする。
       */
      if (blockerBp < emergencyBlockerBp) {
        emergencyBlockerIndex = index;
        emergencyBlockerBp = blockerBp;
      }
    }

    if (safeBlockerIndex !== null) {
      return safeBlockerIndex;
    }

    if (defenderPlayer.board.lifeArea.length <= 2) {
      return emergencyBlockerIndex;
    }

    return null;
  }

  private static getPlayer(game: Game, playerId: string): Player {
    if (game.player1.id === playerId) {
      return game.player1;
    }

    if (game.player2.id === playerId) {
      return game.player2;
    }

    throw new Error(`Unknown playerId: ${playerId}`);
  }
}