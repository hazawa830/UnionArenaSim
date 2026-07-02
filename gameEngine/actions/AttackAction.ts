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
import { ContinuousEffectResolver } from "../effects/ContinuousEffectResolver";
import { KeywordResolver } from "../keywords/KeywordResolver";

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
    attacker.attackedThisTurnCount++;

    if (
      attacker.attackedThisTurnCount === 1 &&
      attacker.card.hasKeyword("doubleAttack")
    ) {
      attacker.isRest = false;
    }
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
      { attacker }
    );

    const damage = KeywordResolver.getDirectDamage(attacker);

    this.dealLifeDamage(
      game,
      opponentPlayer,
      currentPlayer,
      damage
    );
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

    if (attacker.cannotBeBlockedByMinBp !== undefined) {
      if (blocker.getCurrentBp() >= attacker.cannotBeBlockedByMinBp) {
        throw new Error("This attacker cannot be blocked by this blocker.");
      }
    }

    blocker.isRest = true;
    blocker.blockedThisTurnCount++;

    if (
      blocker.blockedThisTurnCount === 1 &&
      blocker.card.hasKeyword("doubleBlock")
    ) {
      blocker.isRest = false;
    }
    const attackerContext = {
      game,
      source: attacker,
      actor: currentPlayer,
      opponent: opponentPlayer,
    };

    const blockerContext = {
      game,
      source: blocker,
      actor: opponentPlayer,
      opponent: currentPlayer,
    };

    const attackerBp = ContinuousEffectResolver.getCurrentBp(
      attackerContext,
      attacker
    );

    const blockerBp = ContinuousEffectResolver.getCurrentBp(
      blockerContext,
      blocker
    );

    if (attackerBp >= blockerBp) {
      EffectResolver.resolveForField(
        game,
        EffectTrigger.OnBattleWin,
        currentPlayer,
        opponentPlayer,
        { attacker }
      );

      const destroyed = blockerSlot.removeCard();

      if (destroyed) {
        opponentPlayer.board.trash.push(destroyed);
      }

      const impactDamage = KeywordResolver.getImpactDamage(attacker);

      if (impactDamage > 0) {
        this.dealLifeDamage(game, opponentPlayer, currentPlayer, impactDamage);
      }
    }
  }

  private static dealLifeDamage(
    game: Game,
    damagedPlayer: Player,
    attackerPlayer: Player,
    damage: number
  ): void {
    for (let i = 0; i < damage; i++) {
      const lifeCard = damagedPlayer.board.lifeArea.pop();

      if (!lifeCard) {
        game.winner = game.currentPlayerId;
        return;
      }

      TriggerAction.resolve(game, lifeCard, damagedPlayer, attackerPlayer);

      if (damagedPlayer.board.lifeArea.length === 0) {
        game.winner = game.currentPlayerId;
        return;
      }
    }
  }
}