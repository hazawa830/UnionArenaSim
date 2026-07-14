import { describe, expect, it } from "vitest";

import { GameFactory } from "../gameEngine/factory/GameFactory";
import { CpuBlockDecider } from "../gameEngine/cpu/CpuBlockDecider";
import { createTestCharacterCard } from "./helpers/createTestCard";
describe("CpuBlockDecider", () => {
  it("BPで勝てるブロッカーがいる場合、そのブロッカーを選ぶ", () => {
    const game = GameFactory.createSampleGame();

    const attacker = game.player1.board.hand.shift();
    const blocker = game.player2.board.hand.shift();

    if (!attacker || !blocker) {
      throw new Error("手札が空です");
    }

    attacker.temporaryBpBonus = 0;
    blocker.temporaryBpBonus = 10000;

    game.player1.board.frontLine[0].setCard(attacker);
    game.player2.board.frontLine[0].setCard(blocker);

    const blockerIndex = CpuBlockDecider.chooseBlockerIndex(
      game,
      game.player1.id,
      game.player2.id,
      0
    );

    expect(blockerIndex).toBe(0);
  });

  it("アクティブなブロッカーがいない場合、nullを返す", () => {
    const game = GameFactory.createSampleGame();

    const attacker = game.player1.board.hand.shift();
    const blocker = game.player2.board.hand.shift();

    if (!attacker || !blocker) {
      throw new Error("手札が空です");
    }

    blocker.isRest = true;
    blocker.temporaryBpBonus = 10000;

    game.player1.board.frontLine[0].setCard(attacker);
    game.player2.board.frontLine[0].setCard(blocker);

    const blockerIndex = CpuBlockDecider.chooseBlockerIndex(
      game,
      game.player1.id,
      game.player2.id,
      0
    );

    expect(blockerIndex).toBeNull();
  });

  it("BPで勝てない場合、ライフが多ければブロックしない", () => {
    const game = GameFactory.createSampleGame();

    const attacker = game.player1.board.hand.shift();
    const blocker = game.player2.board.hand.shift();

    if (!attacker || !blocker) {
      throw new Error("手札が空です");
    }

    attacker.temporaryBpBonus = 10000;
    blocker.temporaryBpBonus = 0;

    game.player1.board.frontLine[0].setCard(attacker);
    game.player2.board.frontLine[0].setCard(blocker);

    const blockerIndex = CpuBlockDecider.chooseBlockerIndex(
      game,
      game.player1.id,
      game.player2.id,
      0
    );

    expect(blockerIndex).toBeNull();
  });

  
});