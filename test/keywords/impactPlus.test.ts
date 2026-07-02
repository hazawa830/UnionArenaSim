import { describe, it, expect } from "vitest";

import { createTestGame } from "../helpers/createTestGame";
import { TestCardFactory } from "../helpers/TestCardFactory";
import { advanceToAttackPhase } from "../helpers/gamePhaseHelper";

import { AttackAction } from "../../gameEngine/actions/AttackAction";

describe("Keyword: impactPlus", () => {
  it("インパクト① + インパクト+1 は、バトル勝利時に2ダメージを与える", () => {
    const game = createTestGame();
    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "インパクト+持ち",
      bp: 5000,
      keywords: [
        { type: "impact", value: 1 },
        { type: "impactPlus", value: 1 },
      ],
    });

    const blocker = TestCardFactory.createCharacter({
      name: "ブロッカー",
      bp: 3000,
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);
    defenderPlayer.board.frontLine[0].setCard(blocker);

    const lifeBefore = defenderPlayer.board.lifeArea.length;

    AttackAction.execute(game, 0, 0);

    expect(defenderPlayer.board.lifeArea.length).toBe(lifeBefore - 2);
  });

  it("インパクト①を2つ持っても、インパクト①として扱う", () => {
    const game = createTestGame();
    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "インパクト重複持ち",
      bp: 5000,
      keywords: [
        { type: "impact", value: 1 },
        { type: "impact", value: 1 },
      ],
    });

    const blocker = TestCardFactory.createCharacter({
      name: "ブロッカー",
      bp: 3000,
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);
    defenderPlayer.board.frontLine[0].setCard(blocker);

    const lifeBefore = defenderPlayer.board.lifeArea.length;

    AttackAction.execute(game, 0, 0);

    expect(defenderPlayer.board.lifeArea.length).toBe(lifeBefore - 1);
  });

  it("インパクトを持たずインパクト+1だけを持つ場合、インパクト②として扱う", () => {
    const game = createTestGame();
    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "インパクト+のみ",
      bp: 5000,
      keywords: [{ type: "impactPlus", value: 1 }],
    });

    const blocker = TestCardFactory.createCharacter({
      name: "ブロッカー",
      bp: 3000,
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);
    defenderPlayer.board.frontLine[0].setCard(blocker);

    const lifeBefore = defenderPlayer.board.lifeArea.length;

    AttackAction.execute(game, 0, 0);

    expect(defenderPlayer.board.lifeArea.length).toBe(lifeBefore - 2);
  });
});