import { describe, it, expect } from "vitest";

import { createTestGame } from "../helpers/createTestGame";
import { TestCardFactory } from "../helpers/TestCardFactory";
import { advanceToAttackPhase } from "../helpers/gamePhaseHelper";

import { BoardLine } from "../../gameEngine/enum/BoardLine";
import { AttackAction } from "../../gameEngine/actions/AttackAction";

describe("Keyword: impact", () => {
  it("インパクト①を持つキャラがバトルに勝利した時、相手ライフに1ダメージを与える", () => {
    const game = createTestGame();

    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "インパクト持ち",
      bp: 5000,
      keywords: [
        {
          type: "impact",
          value: 1,
        },
      ],
    });

    const blocker = TestCardFactory.createCharacter({
      name: "ブロッカー",
      bp: 3000,
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);
    defenderPlayer.board.frontLine[0].setCard(blocker);

    const lifeBefore = defenderPlayer.board.lifeArea.length;
    const trashBefore = defenderPlayer.board.trash.length;

    AttackAction.execute(game, 0, 0);

    expect(defenderPlayer.board.frontLine[0].isEmpty()).toBe(true);
    expect(defenderPlayer.board.trash).toContain(blocker);

    expect(defenderPlayer.board.lifeArea.length).toBe(lifeBefore - 1);
    expect(defenderPlayer.board.trash.length).toBe(trashBefore + 2);
  });

  it("インパクトを持たないキャラがバトルに勝利しても、相手ライフにダメージを与えない", () => {
    const game = createTestGame();

    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "通常キャラ",
      bp: 5000,
    });

    const blocker = TestCardFactory.createCharacter({
      name: "ブロッカー",
      bp: 3000,
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);
    defenderPlayer.board.frontLine[0].setCard(blocker);

    const lifeBefore = defenderPlayer.board.lifeArea.length;

    AttackAction.execute(game, 0, 0);

    expect(defenderPlayer.board.frontLine[0].isEmpty()).toBe(true);
    expect(defenderPlayer.board.trash).toContain(blocker);

    expect(defenderPlayer.board.lifeArea.length).toBe(lifeBefore);
  });
});