import { Game } from "../core/Game";
import { Player } from "../core/Player";
import { CardInstance } from "../cards/CardInstance";

import { GamePhase } from "../enum/GamePhase";
import { PlayerId } from "../enum/PlayerId";
import { ActionSource } from "../enum/ActionSource";
import { CardType } from "../enum/CardType";

import { TriggerAction } from "./TriggerAction";
import { EffectResolver } from "../effects/EffectResolver";
import { EffectTrigger } from "../effects/EffectTrigger";

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

    const attacker = this.getValidAttacker(currentPlayer, attackerIndex);

    attacker.isRest = true;

    if (blockerIndex !== undefined) {
      this.resolveBlockedAttack(game, attackerIndex, blockerIndex);
      return;
    }

    this.resolveDirectAttack(game, attacker, currentPlayer, opponentPlayer);
  }

  private static getValidAttacker(
    currentPlayer: Player,
    attackerIndex: number
  ): CardInstance {
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

    return attacker;
  }

  private static resolveBlockedAttack(
    game: Game,
    attackerIndex: number,
    blockerIndex: number
  ): void {
    this.resolveBlock(game, attackerIndex, blockerIndex);
  }

  private static resolveDirectAttack(
    game: Game,
    attacker: CardInstance,
    currentPlayer: Player,
    opponentPlayer: Player
  ): void {
    EffectResolver.resolveForField(
      game,
      EffectTrigger.OnAttackNotBlocked,
      currentPlayer,
      opponentPlayer,
      {
        attacker,
      }
    );

    const lifeCard = opponentPlayer.board.lifeArea.pop();

    if (!lifeCard) {
      throw new Error("Opponent has no life.");
    }

    TriggerAction.resolve(game, lifeCard, opponentPlayer, currentPlayer);

    if (opponentPlayer.board.lifeArea.length === 0) {
      game.winner =
        game.currentPlayerId === PlayerId.Player1
          ? PlayerId.Player1
          : PlayerId.Player2;
    }
  }

  private static resolveBlock(
    game: Game,
    attackerIndex: number,
    blockerIndex: number
  ): void {
    const currentPlayer = game.getCurrentPlayer();
    const opponentPlayer = game.getOpponentPlayer();

    const attackerSlot = currentPlayer.board.frontLine[attackerIndex];
    const blockerSlot = opponentPlayer.board.frontLine[blockerIndex];

    if (!attackerSlot) {
      throw new Error(`Invalid attacker slot. index=${attackerIndex}`);
    }

    if (!blockerSlot) {
      throw new Error(`Invalid blocker slot. index=${blockerIndex}`);
    }

    const attacker = attackerSlot.getCard();
    const blocker = blockerSlot.getCard();

    if (!attacker) {
      throw new Error("Attacker slot is empty.");
    }

    if (!blocker) {
      throw new Error("Blocker slot is empty.");
    }

    if (blocker.card.cardType !== CardType.Character) {
      throw new Error("Only character cards can block.");
    }

    if (blocker.isRest) {
      throw new Error("Rested card cannot block.");
    }

    blocker.isRest = true;

    if (attacker.getCurrentBp() >= blocker.getCurrentBp()) {
      const destroyed = blockerSlot.removeCard();

      if (destroyed) {
        opponentPlayer.board.trash.push(destroyed);
      }
    }
  }
}