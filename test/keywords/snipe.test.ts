import { describe, it, expect } from "vitest";

import { createTestGame } from "../helpers/createTestGame";
import { TestCardFactory } from "../helpers/TestCardFactory";
import { advanceToAttackPhase } from "../helpers/gamePhaseHelper";

import { AttackAction } from "../../gameEngine/actions/AttackAction";
import { ActionSource } from "../../gameEngine/enum/ActionSource";
import { Effect } from "../../gameEngine/effects/Effect";
import { EffectTrigger } from "../../gameEngine/effects/EffectTrigger";

describe("Keyword: snipe", () => {
  it("狙い撃ちを持つキャラは相手フロントラインのキャラを指定してバトルできる", () => {
    const game = createTestGame();
    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "狙い撃ち持ち",
      bp: 5000,
      keywords: [{ type: "snipe" }],
    });

    const target = TestCardFactory.createCharacter({
      name: "狙い撃ち対象",
      bp: 3000,
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);
    defenderPlayer.board.frontLine[0].setCard(target);

    AttackAction.execute(
      game,
      0,
      undefined,
      ActionSource.PlayerNormal,
      { type: "frontLineCharacter", index: 0 }
    );

    expect(defenderPlayer.board.frontLine[0].isEmpty()).toBe(true);
    expect(defenderPlayer.board.trash).toContain(target);
  });

  it("狙い撃ちを持たないキャラは相手フロントラインのキャラを指定してアタックできない", () => {
    const game = createTestGame();
    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "通常キャラ",
      bp: 5000,
    });

    const target = TestCardFactory.createCharacter({
      name: "対象キャラ",
      bp: 3000,
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);
    defenderPlayer.board.frontLine[0].setCard(target);

    expect(() =>
      AttackAction.execute(
        game,
        0,
        undefined,
        ActionSource.PlayerNormal,
        { type: "frontLineCharacter", index: 0 }
      )
    ).toThrow("Only snipe characters can attack front line characters.");

    expect(defenderPlayer.board.frontLine[0].getCard()).toBe(target);
    expect(defenderPlayer.board.trash).not.toContain(target);
  });

  it("狙い撃ち攻撃ではブロッカーを同時に指定できない", () => {
    const game = createTestGame();
    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "狙い撃ち持ち",
      bp: 5000,
      keywords: [{ type: "snipe" }],
    });

    const target = TestCardFactory.createCharacter({
      name: "狙い撃ち対象",
      bp: 3000,
    });

    const blocker = TestCardFactory.createCharacter({
      name: "別ブロッカー",
      bp: 3000,
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);
    defenderPlayer.board.frontLine[0].setCard(target);
    defenderPlayer.board.frontLine[1].setCard(blocker);

    expect(() =>
      AttackAction.execute(
        game,
        0,
        1,
        ActionSource.PlayerNormal,
        { type: "frontLineCharacter", index: 0 }
      )
    ).toThrow("Snipe attack cannot specify a blocker.");

    expect(defenderPlayer.board.frontLine[0].getCard()).toBe(target);
    expect(defenderPlayer.board.frontLine[1].getCard()).toBe(blocker);
  });

  it("狙い撃ち + インパクトで、バトル勝利時に相手ライフへダメージを与える", () => {
    const game = createTestGame();
    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "狙い撃ちインパクト持ち",
      bp: 5000,
      keywords: [
        { type: "snipe" },
        { type: "impact", value: 1 },
      ],
    });

    const target = TestCardFactory.createCharacter({
      name: "狙い撃ち対象",
      bp: 3000,
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);
    defenderPlayer.board.frontLine[0].setCard(target);

    const lifeBefore = defenderPlayer.board.lifeArea.length;

    AttackAction.execute(
      game,
      0,
      undefined,
      ActionSource.PlayerNormal,
      { type: "frontLineCharacter", index: 0 }
    );

    expect(defenderPlayer.board.frontLine[0].isEmpty()).toBe(true);
    expect(defenderPlayer.board.trash).toContain(target);
    expect(defenderPlayer.board.lifeArea.length).toBe(lifeBefore - 1);
  });

  it("狙い撃ち + OnBattleWinで、バトル勝利時効果が発動する", () => {
    const game = createTestGame();
    const attackerPlayer = game.getCurrentPlayer();
    const defenderPlayer = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const effects: Effect[] = [
      {
        id: "battle-win-draw",
        trigger: EffectTrigger.OnBattleWin,
        conditions: [{ type: "attackerIsSelf" }],
        actions: [{ type: "draw", count: 1 }],
      },
    ];

    const attacker = TestCardFactory.createCharacter({
      name: "狙い撃ちバトル勝利時持ち",
      bp: 5000,
      keywords: [{ type: "snipe" }],
      effects,
    });

    const target = TestCardFactory.createCharacter({
      name: "狙い撃ち対象",
      bp: 3000,
    });

    attackerPlayer.board.frontLine[0].setCard(attacker);
    defenderPlayer.board.frontLine[0].setCard(target);

    const handBefore = attackerPlayer.board.hand.length;
    const deckBefore = attackerPlayer.board.deck.length;

    AttackAction.execute(
      game,
      0,
      undefined,
      ActionSource.PlayerNormal,
      { type: "frontLineCharacter", index: 0 }
    );

    expect(attackerPlayer.board.hand.length).toBe(handBefore + 1);
    expect(attackerPlayer.board.deck.length).toBe(deckBefore - 1);
    expect(defenderPlayer.board.trash).toContain(target);
  });
});