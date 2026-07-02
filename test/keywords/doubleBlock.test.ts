import { describe, it, expect } from "vitest";

import { createTestGame } from "../helpers/createTestGame";
import { TestCardFactory } from "../helpers/TestCardFactory";
import { advanceToAttackPhase } from "../helpers/gamePhaseHelper";

import { AttackAction } from "../../gameEngine/actions/AttackAction";

describe("Keyword: doubleBlock", () => {
  it("2回ブロックを持つキャラは初回ブロック後にアクティブになる", () => {
    const game = createTestGame();
    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "攻撃キャラ",
      bp: 3000,
    });

    const blocker = TestCardFactory.createCharacter({
      name: "2回ブロック持ち",
      bp: 5000,
      keywords: [{ type: "doubleBlock" }],
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);
    defenderPlayer.board.frontLine[0].setCard(blocker);

    AttackAction.execute(game, 0, 0);

    expect(blocker.blockedThisTurnCount).toBe(1);
    expect(blocker.isRest).toBe(false);
  });

  it("2回ブロックを持つキャラでも2回目のブロック後はレストのまま", () => {
    const game = createTestGame();
    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker1 = TestCardFactory.createCharacter({
      name: "攻撃キャラ1",
      bp: 3000,
    });

    const attacker2 = TestCardFactory.createCharacter({
      name: "攻撃キャラ2",
      bp: 3000,
    });

    const blocker = TestCardFactory.createCharacter({
      name: "2回ブロック持ち",
      bp: 5000,
      keywords: [{ type: "doubleBlock" }],
    });

    attackerPlayer.board.frontLine[0].setCard(attacker1);
    attackerPlayer.board.frontLine[1].setCard(attacker2);
    defenderPlayer.board.frontLine[0].setCard(blocker);

    AttackAction.execute(game, 0, 0);
    AttackAction.execute(game, 1, 0);

    expect(blocker.blockedThisTurnCount).toBe(2);
    expect(blocker.isRest).toBe(true);
  });

  it("ターン状態リセット後は再び初回ブロック扱いになる", () => {
    const game = createTestGame();
    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker1 = TestCardFactory.createCharacter({
      name: "攻撃キャラ1",
      bp: 3000,
    });

    const attacker2 = TestCardFactory.createCharacter({
      name: "攻撃キャラ2",
      bp: 3000,
    });

    const blocker = TestCardFactory.createCharacter({
      name: "2回ブロック持ち",
      bp: 5000,
      keywords: [{ type: "doubleBlock" }],
    });

    attackerPlayer.board.frontLine[0].setCard(attacker1);
    attackerPlayer.board.frontLine[1].setCard(attacker2);
    defenderPlayer.board.frontLine[0].setCard(blocker);

    AttackAction.execute(game, 0, 0);

    expect(blocker.blockedThisTurnCount).toBe(1);
    expect(blocker.isRest).toBe(false);

    defenderPlayer.board.clearTurnState();

    AttackAction.execute(game, 1, 0);

    expect(blocker.blockedThisTurnCount).toBe(1);
    expect(blocker.isRest).toBe(false);
  });
});