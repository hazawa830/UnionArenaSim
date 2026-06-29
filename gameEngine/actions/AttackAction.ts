import { Game } from "../core/Game";
import { GamePhase } from "../enum/GamePhase";
import { PlayerId } from "../enum/PlayerId";
import { ActionSource } from "../enum/ActionSource";
import { CardType } from "../enum/CardType";
export class AttackAction {
  public static execute(
    game: Game,
    attackerIndex: number,
    source: ActionSource = ActionSource.PlayerNormal
  ): void {
    
    if (source === ActionSource.PlayerNormal && game.phase !== GamePhase.Attack) {
      throw new Error("Normal attack is only allowed in attack phase.");
    }

    const currentPlayer = game.getCurrentPlayer();
    const opponentPlayer = game.getOpponentPlayer();

    const attackerSlot = currentPlayer.board.frontLine[attackerIndex];

    if (!attackerSlot) {
      throw new Error(`Invalid attacker slot. index=${attackerIndex}`);
    }

    const attacker = attackerSlot.getCard();

    if (!attacker) {
      throw new Error("Attacker slot is empty.");
    }
    if (attacker.card.cardType !== CardType.Character) {
      throw new Error("Only character cards can attack.");
    }
    if (attacker.isRest) {
      throw new Error("Rested card cannot attack.");
    }

    attacker.isRest = true;

    const lifeCard = opponentPlayer.board.lifeArea.pop();

    if (!lifeCard) {
      throw new Error("Opponent has no life.");
    }

    opponentPlayer.board.trash.push(lifeCard);

    if (opponentPlayer.board.lifeArea.length === 0) {
      game.winner =
        game.currentPlayerId === PlayerId.Player1
          ? PlayerId.Player1
          : PlayerId.Player2;
    }
  }
}