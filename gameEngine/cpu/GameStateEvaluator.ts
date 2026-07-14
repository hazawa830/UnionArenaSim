import { Game } from "../core/Game";
import { Player } from "../core/Player";
import { CardType } from "../enum/CardType";
import { PlayerId } from "../enum/PlayerId";

export class GameStateEvaluator {
  public static evaluate(game: Game, playerId: string): number {
    const player = this.getPlayer(game, playerId);
    const opponent = this.getOpponent(game, playerId);

    if (game.winner === player.id) {
      return 100000;
    }

    if (game.winner === opponent.id) {
      return -100000;
    }

    let score = 0;

    score += this.evaluateLife(player, opponent);
    score += this.evaluateBoardBp(player, opponent);
    score += this.evaluateCardAdvantage(player, opponent);
    score += this.evaluateBoardPresence(player, opponent);
    score += this.evaluateActionPoints(player);
    score += this.evaluateEnergy(player, opponent);

    return score;
  }

  private static getPlayer(game: Game, playerId: string): Player {
    if (game.player1.id === playerId) return game.player1;
    if (game.player2.id === playerId) return game.player2;

    throw new Error(`Unknown playerId: ${playerId}`);
  }

  private static getOpponent(game: Game, playerId: string): Player {
    if (game.player1.id === playerId) return game.player2;
    if (game.player2.id === playerId) return game.player1;

    throw new Error(`Unknown playerId: ${playerId}`);
  }

  private static evaluateLife(player: Player, opponent: Player): number {
    const ownLife = player.board.lifeArea.length;
    const opponentLife = opponent.board.lifeArea.length;

    // 相手ライフを削る価値を高めにする
    return (ownLife - opponentLife) * 1000;
  }

  private static evaluateBoardBp(player: Player, opponent: Player): number {
    const ownBp = this.getFrontLineBpTotal(player);
    const opponentBp = this.getFrontLineBpTotal(opponent);

    return ownBp - opponentBp;
  }

  private static evaluateCardAdvantage(player: Player, opponent: Player): number {
    const ownCards =
      player.board.hand.length +
      this.countFrontLineCards(player) +
      this.countEnergyLineCards(player);

    const opponentCards =
      opponent.board.hand.length +
      this.countFrontLineCards(opponent) +
      this.countEnergyLineCards(opponent);

    return (ownCards - opponentCards) * 80;
  }

  private static evaluateBoardPresence(player: Player, opponent: Player): number {
    const ownFrontCount = this.countFrontLineCards(player);
    const opponentFrontCount = this.countFrontLineCards(opponent);

    return (ownFrontCount - opponentFrontCount) * 250;
  }

  private static evaluateActionPoints(player: Player): number {
      // シミュレーション途中評価用。APが残っている盤面は少しだけ価値あり。
      return player.board.activeActionPoint * 20;
    }
    private static evaluateEnergy(player: Player, opponent: Player): number {
    const ownEnergy = this.countEnergyLineCards(player);
    const opponentEnergy = this.countEnergyLineCards(opponent);

    let score = 0;

    // エナジー枚数差そのものを評価
    score += (ownEnergy - opponentEnergy) * 180;

    // 序盤のエナジー不足を重めにペナルティ
    if (ownEnergy === 0) {
      score -= 700;
    } else if (ownEnergy === 1) {
      score -= 400;
    } else if (ownEnergy === 2) {
      score -= 150;
    }

    // 3エナジー以上は最低限動けるので軽め
    if (ownEnergy >= 3) {
      score += 100;
    }

    return score;
  }
  private static getFrontLineBpTotal(player: Player): number {
    return player.board.frontLine.reduce((total, slot) => {
      const card = slot.getCard();

      if (!card) {
        return total;
      }

      if (card.card.cardType !== CardType.Character) {
        return total;
      }

      try {
        return total + card.getCurrentBp();
      } catch {
        return total;
      }
    }, 0);
  }

  private static countFrontLineCards(player: Player): number {
    return player.board.frontLine.filter((slot) => !slot.isEmpty()).length;
  }

  private static countEnergyLineCards(player: Player): number {
    return player.board.energyLine.filter((slot) => !slot.isEmpty()).length;
  }
}