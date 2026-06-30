import { Game } from "../core/Game";
import { GamePhase } from "../enum/GamePhase";

import { ActionSource } from "../enum/ActionSource";
import { CardType } from "../enum/CardType";
import { CharacterCard } from "../cards/CharacterCard";
import { TriggerAction } from "./TriggerAction";

export class AttackAction {
  public static execute(
    game: Game,
    attackerIndex: number,
    blockerIndex?: number,
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

    if (blockerIndex !== undefined) {
      this.resolveBlock(game, attackerIndex, blockerIndex);
      return;
    }

    const lifeCard = opponentPlayer.board.lifeArea.pop();

    if (!lifeCard) {
      throw new Error("Opponent has no life.");
    }

    TriggerAction.resolve(game, lifeCard, opponentPlayer, currentPlayer);

    if (!lifeCard) {
      throw new Error("Opponent has no life.");
    }

    if (opponentPlayer.board.lifeArea.length === 0) {
      game.winner = game.currentPlayerId;
    }
  }

  private static resolveBlock(
    game: Game,
    attackerIndex: number,
    blockerIndex: number
  ): void {
    const currentPlayer = game.getCurrentPlayer();
    const opponentPlayer = game.getOpponentPlayer();

    const attacker = currentPlayer.board.frontLine[attackerIndex].getCard();
    const blockerSlot = opponentPlayer.board.frontLine[blockerIndex];

    if (!attacker) {
      throw new Error("Attacker slot is empty.");
    }

    if (!blockerSlot) {
      throw new Error(`Invalid blocker slot. index=${blockerIndex}`);
    }

    const blocker = blockerSlot.getCard();

    if (!blocker) {
      throw new Error("Blocker slot is empty.");
    }

    if (blocker.card.cardType !== CardType.Character) {
      throw new Error("Only character cards can block.");
    }

    if (blocker.isRest) {
      throw new Error("Rested card cannot block.");
    }

    const attackerCard = attacker.card as CharacterCard;
    const blockerCard = blocker.card as CharacterCard;

    if (attackerCard.bp >= blockerCard.bp) {
      const destroyed = blockerSlot.removeCard();

      if (destroyed) {
        opponentPlayer.board.trash.push(destroyed);
      }
    } else {
      blocker.isRest = true;
    }
  }
}