import { Game } from "../core/Game";
import { Player } from "../core/Player";
import { CardInstance } from "../cards/CardInstance";
import { Slot } from "../models/Slot";

import { GamePhase } from "../enum/GamePhase";
import { ActionSource } from "../enum/ActionSource";
import { CardType } from "../enum/CardType";

import { TriggerAction } from "./TriggerAction";
import { EffectResolver } from "../effects/EffectResolver";
import { EffectTrigger } from "../effects/EffectTrigger";
import { ContinuousEffectResolver } from "../effects/ContinuousEffectResolver";
import { KeywordResolver } from "../keywords/KeywordResolver";
import { AttackTarget } from "./AttackTarget";

export class AttackAction {
  public static execute(
    game: Game,
    attackerIndex: number,
    blockerIndex?: number,
    source: ActionSource = ActionSource.PlayerNormal,
    attackTarget: AttackTarget = { type: "player" }
  ): void {
    if (source === ActionSource.PlayerNormal && game.phase !== GamePhase.Attack) {
      throw new Error("Normal attack is only allowed in attack phase.");
    }
    if (
      attackTarget.type === "frontLineCharacter" &&
      blockerIndex !== undefined
    ) {
      throw new Error(
        "Snipe attack cannot specify a blocker."
      );
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

    if (attackTarget.type === "frontLineCharacter") {
      this.resolveSnipeAttack(
        game,
        attacker,
        currentPlayer,
        opponentPlayer,
        attackTarget.index
      );
      return;
    }

    if (blockerIndex !== undefined) {
      this.resolveBlock(game, attackerIndex, blockerIndex);
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
    this.dealLifeDamage(game, opponentPlayer, currentPlayer, damage);
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

    this.resolveBattle(
      game,
      attacker,
      blocker,
      blockerSlot,
      currentPlayer,
      opponentPlayer,
      { isBlock: true }
    );
  }

  private static resolveSnipeAttack(
    game: Game,
    attacker: CardInstance,
    currentPlayer: Player,
    opponentPlayer: Player,
    targetIndex: number
  ): void {
    if (!attacker.card.hasKeyword("snipe")) {
      throw new Error("Only snipe characters can attack front line characters.");
    }

    const targetSlot = opponentPlayer.board.frontLine[targetIndex];

    if (!targetSlot) {
      throw new Error(`Invalid snipe target slot. index=${targetIndex}`);
    }

    const target = targetSlot.getCard();

    if (!target) {
      throw new Error("Snipe target slot is empty.");
    }

    this.resolveBattle(
      game,
      attacker,
      target,
      targetSlot,
      currentPlayer,
      opponentPlayer,
      { isBlock: false }
    );
  }

  private static resolveBattle(
    game: Game,
    attacker: CardInstance,
    battleTarget: CardInstance,
    battleTargetSlot: Slot,
    currentPlayer: Player,
    opponentPlayer: Player,
    options: {
      isBlock: boolean;
    }
  ): void {
    if (options.isBlock) {
      this.validateAndRestBlocker(attacker, battleTarget);
    }

    const attackerContext = {
      game,
      source: attacker,
      actor: currentPlayer,
      opponent: opponentPlayer,
    };

    const targetContext = {
      game,
      source: battleTarget,
      actor: opponentPlayer,
      opponent: currentPlayer,
    };

    const attackerBp = ContinuousEffectResolver.getCurrentBp(
      attackerContext,
      attacker
    );

    const targetBp = ContinuousEffectResolver.getCurrentBp(
      targetContext,
      battleTarget
    );

    if (attackerBp < targetBp) {
      return;
    }

    EffectResolver.resolveForField(
      game,
      EffectTrigger.OnBattleWin,
      currentPlayer,
      opponentPlayer,
      { attacker }
    );

    const destroyed = battleTargetSlot.removeCard();

    if (destroyed) {
      opponentPlayer.board.trash.push(destroyed);
    }

    const impactDamage = KeywordResolver.getImpactDamageForBattle(
      attacker,
      battleTarget
    );

    if (impactDamage > 0) {
      this.dealLifeDamage(game, opponentPlayer, currentPlayer, impactDamage);
    }
  }

  private static validateAndRestBlocker(
    attacker: CardInstance,
    blocker: CardInstance
  ): void {
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