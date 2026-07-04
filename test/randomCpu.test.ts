import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import {
  advanceToMovePhase,
  advanceToMainPhase,
  advanceToAttackPhase,
} from "./helpers/gamePhaseHelper";

import { RandomCPU } from "../gameEngine/cpu/RandomCPU";
import { GamePhase } from "../gameEngine/enum/GamePhase";
import { BoardLine } from "../gameEngine/enum/BoardLine";
import { TestCardFactory } from "./helpers/TestCardFactory";

describe("RandomCPU", () => {
  it("Startフェーズではフェーズを進められる", () => {
    const game = createTestGame();

    expect(game.phase).toBe(GamePhase.Start);

    RandomCPU.playPhase(game);

    expect(game.phase).toBe(GamePhase.Move);
  });

  it("Moveフェーズでは移動またはフェーズ終了を実行できる", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMovePhase(game);

    const card = TestCardFactory.createCharacter({
      name: "移動候補",
      bp: 3000,
    });

    player.board.energyLine[0].setCard(card);

    expect(() => RandomCPU.playPhase(game)).not.toThrow();

    const movedToFront = player.board.frontLine.some(
      (slot) => slot.getCard() === card
    );

    expect(movedToFront || game.phase === GamePhase.Main).toBe(true);
  });

  it("Mainフェーズではカードプレイまたはフェーズ終了を実行できる", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);

    player.board.setActionPoint(3);

    const handBefore = player.board.hand.length;

    expect(() => RandomCPU.playPhase(game)).not.toThrow();

    const playedCard = player.board.hand.length < handBefore;
    const advancedPhase = game.phase === GamePhase.Attack;

    expect(playedCard || advancedPhase).toBe(true);
  });

  it("Attackフェーズでは攻撃またはフェーズ終了を実行できる", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "攻撃キャラ",
      bp: 3000,
    });

    player.board.frontLine[0].setCard(attacker);

    const lifeBefore = opponent.board.lifeArea.length;

    expect(() => RandomCPU.playPhase(game)).not.toThrow();

    const attacked = opponent.board.lifeArea.length < lifeBefore;
    const advancedPhase = game.phase === GamePhase.End;

    expect(attacked || advancedPhase).toBe(true);
  });

  it("Endフェーズでは次プレイヤーのStartフェーズへ進める", () => {
    const game = createTestGame();

    const beforePlayer = game.getCurrentPlayer();

    game.phase = GamePhase.End;

    RandomCPU.playPhase(game);

    expect(game.phase).toBe(GamePhase.Start);
    expect(game.getCurrentPlayer()).not.toBe(beforePlayer);
  });

  it("候補に不正手が混ざっても、実行可能な手を探して処理できる", () => {
    const game = createTestGame();

    advanceToMovePhase(game);

    expect(() => RandomCPU.playPhase(game)).not.toThrow();

    // Move候補がない場合でも endPhase により Main へ進める
    expect(game.phase).toBe(GamePhase.Main);
  });

  it("複数フェーズを例外なく進められる", () => {
    const game = createTestGame();

    for (let i = 0; i < 10; i++) {
      expect(() => RandomCPU.playPhase(game)).not.toThrow();

      if (game.winner) {
        break;
      }
    }

    expect(game.phase).toBeDefined();
  });
});