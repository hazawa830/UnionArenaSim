import { describe, it, expect } from "vitest";

import { createTestGame } from "../helpers/createTestGame";
import { TestCardFactory } from "../helpers/TestCardFactory";
import { advanceToAttackPhase } from "../helpers/gamePhaseHelper";

import { AttackAction } from "../../gameEngine/actions/AttackAction";

describe("Keyword: impactNullify", () => {
  it("インパクト無効を持つキャラとバトルした場合、インパクトダメージを受けない", () => {
    const game = createTestGame();
    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "インパクト持ち",
      bp: 5000,
      keywords: [{ type: "impact", value: 1 }],
    });

    const blocker = TestCardFactory.createCharacter({
      name: "インパクト無効持ち",
      bp: 3000,
      keywords: [{ type: "impactNullify" }],
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);
    defenderPlayer.board.frontLine[0].setCard(blocker);

    const lifeBefore = defenderPlayer.board.lifeArea.length;

    AttackAction.execute(game, 0, 0);

    expect(defenderPlayer.board.frontLine[0].isEmpty()).toBe(true);
    expect(defenderPlayer.board.trash).toContain(blocker);

    expect(defenderPlayer.board.lifeArea.length).toBe(lifeBefore);
  });

  it("インパクト無効を持たないキャラとバトルした場合、インパクトダメージを受ける", () => {
    const game = createTestGame();
    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "インパクト持ち",
      bp: 5000,
      keywords: [{ type: "impact", value: 1 }],
    });

    const blocker = TestCardFactory.createCharacter({
      name: "通常ブロッカー",
      bp: 3000,
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);
    defenderPlayer.board.frontLine[0].setCard(blocker);

    const lifeBefore = defenderPlayer.board.lifeArea.length;

    AttackAction.execute(game, 0, 0);

    expect(defenderPlayer.board.lifeArea.length).toBe(lifeBefore - 1);
  });
});