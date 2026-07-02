import { describe, it, expect } from "vitest";

import { createTestGame } from "../helpers/createTestGame";
import { TestCardFactory } from "../helpers/TestCardFactory";
import { advanceToAttackPhase } from "../helpers/gamePhaseHelper";

import { AttackAction } from "../../gameEngine/actions/AttackAction";

describe("Keyword: doubleAttack", () => {
  it("2回アタックを持つキャラは初回アタック後にアクティブになる", () => {
    const game = createTestGame();
    const attackerPlayer = game.getCurrentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "2回アタック持ち",
      bp: 3000,
      keywords: [{ type: "doubleAttack" }],
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);

    AttackAction.execute(game, 0);

    expect(attacker.attackedThisTurnCount).toBe(1);
    expect(attacker.isRest).toBe(false);
  });

  it("2回アタックを持つキャラでも2回目のアタック後はレストのまま", () => {
    const game = createTestGame();
    const attackerPlayer = game.getCurrentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "2回アタック持ち",
      bp: 3000,
      keywords: [{ type: "doubleAttack" }],
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);

    AttackAction.execute(game, 0);
    AttackAction.execute(game, 0);

    expect(attacker.attackedThisTurnCount).toBe(2);
    expect(attacker.isRest).toBe(true);
  });

  it("ターン状態リセット後は再び初回アタック扱いになる", () => {
    const game = createTestGame();
    const attackerPlayer = game.getCurrentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "2回アタック持ち",
      bp: 3000,
      keywords: [{ type: "doubleAttack" }],
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);

    AttackAction.execute(game, 0);
    expect(attacker.isRest).toBe(false);
    expect(attacker.attackedThisTurnCount).toBe(1);

    attackerPlayer.board.clearTurnState();

    AttackAction.execute(game, 0);

    expect(attacker.attackedThisTurnCount).toBe(1);
    expect(attacker.isRest).toBe(false);
  });
});