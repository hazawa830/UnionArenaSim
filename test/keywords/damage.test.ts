import { describe, it, expect } from "vitest";

import { createTestGame } from "../helpers/createTestGame";
import { TestCardFactory } from "../helpers/TestCardFactory";
import { advanceToAttackPhase } from "../helpers/gamePhaseHelper";

import { AttackAction } from "../../gameEngine/actions/AttackAction";

describe("Keyword: damage", () => {
  it("ダメージ②を持つキャラが直接アタックした時、ライフを2枚失う", () => {
    const game = createTestGame();

    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "ダメージ②持ち",
      bp: 3000,
      keywords: [
        {
          type: "damage",
          value: 2,
        },
      ],
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);

    const lifeBefore = defenderPlayer.board.lifeArea.length;

    AttackAction.execute(game, 0);

    expect(defenderPlayer.board.lifeArea.length).toBe(lifeBefore - 2);
  });

  it("ダメージ②を2つ持ってもダメージ②として扱う", () => {
    const game = createTestGame();

    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "ダメージ②重複",
      bp: 3000,
      keywords: [
        {
          type: "damage",
          value: 2,
        },
        {
          type: "damage",
          value: 2,
        },
      ],
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);

    const lifeBefore = defenderPlayer.board.lifeArea.length;

    AttackAction.execute(game, 0);

    expect(defenderPlayer.board.lifeArea.length).toBe(lifeBefore - 2);
  });

  it("ダメージ②とダメージ+1を持つ場合、3ダメージになる", () => {
    const game = createTestGame();

    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "ダメージ②+1",
      bp: 3000,
      keywords: [
        {
          type: "damage",
          value: 2,
        },
        {
          type: "damagePlus",
          value: 1,
        },
      ],
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);

    const lifeBefore = defenderPlayer.board.lifeArea.length;

    AttackAction.execute(game, 0);

    expect(defenderPlayer.board.lifeArea.length).toBe(lifeBefore - 3);
  });

  it("ダメージ+1だけを持つ場合、2ダメージになる", () => {
    const game = createTestGame();

    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "ダメージ+1のみ",
      bp: 3000,
      keywords: [
        {
          type: "damagePlus",
          value: 1,
        },
      ],
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);

    const lifeBefore = defenderPlayer.board.lifeArea.length;

    AttackAction.execute(game, 0);

    expect(defenderPlayer.board.lifeArea.length).toBe(lifeBefore - 2);
  });

  it("ダメージを持たない場合は通常通り1ダメージ", () => {
    const game = createTestGame();

    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "通常キャラ",
      bp: 3000,
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);

    const lifeBefore = defenderPlayer.board.lifeArea.length;

    AttackAction.execute(game, 0);

    expect(defenderPlayer.board.lifeArea.length).toBe(lifeBefore - 1);
  });
});