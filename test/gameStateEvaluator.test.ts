import { describe, expect, it } from "vitest";

import { GameFactory } from "../gameEngine/factory/GameFactory";
import { GameStateEvaluator } from "../gameEngine/cpu/GameStateEvaluator";

describe("GameStateEvaluator", () => {
  it("相手ライフが少ないほど高評価になる", () => {
    const game = GameFactory.createSampleGame();

    const player = game.player1;
    const opponent = game.player2;

    const baseScore = GameStateEvaluator.evaluate(game, player.id);

    opponent.board.lifeArea.pop();

    const afterDamageScore = GameStateEvaluator.evaluate(game, player.id);

    expect(afterDamageScore).toBeGreaterThan(baseScore);
  });

  it("自分ライフが少ないほど低評価になる", () => {
    const game = GameFactory.createSampleGame();

    const player = game.player1;

    const baseScore = GameStateEvaluator.evaluate(game, player.id);

    player.board.lifeArea.pop();

    const afterDamageScore = GameStateEvaluator.evaluate(game, player.id);

    expect(afterDamageScore).toBeLessThan(baseScore);
  });

  it("自分のフロントBPが増えると高評価になる", () => {
    const game = GameFactory.createSampleGame();

    const player = game.player1;

    const baseScore = GameStateEvaluator.evaluate(game, player.id);

    const card = player.board.hand.shift();

    if (!card) {
      throw new Error("手札が空です");
    }

    player.board.frontLine[0].setCard(card);

    const afterFrontPlayScore = GameStateEvaluator.evaluate(game, player.id);

    expect(afterFrontPlayScore).toBeGreaterThan(baseScore);
  });

  it("相手のフロントBPが増えると低評価になる", () => {
    const game = GameFactory.createSampleGame();

    const player = game.player1;
    const opponent = game.player2;

    const baseScore = GameStateEvaluator.evaluate(game, player.id);

    const card = opponent.board.hand.shift();

    if (!card) {
      throw new Error("相手の手札が空です");
    }

    opponent.board.frontLine[0].setCard(card);

    const afterOpponentFrontPlayScore = GameStateEvaluator.evaluate(
      game,
      player.id
    );

    expect(afterOpponentFrontPlayScore).toBeLessThan(baseScore);
  });

  it("勝利している盤面は非常に高評価になる", () => {
    const game = GameFactory.createSampleGame();

    game.winner = game.player1.id as any;

    const score = GameStateEvaluator.evaluate(game, game.player1.id);

    expect(score).toBeGreaterThan(50000);
  });

  it("敗北している盤面は非常に低評価になる", () => {
    const game = GameFactory.createSampleGame();

    game.winner = game.player2.id as any;

    const score = GameStateEvaluator.evaluate(game, game.player1.id);

    expect(score).toBeLessThan(-50000);
  });
  it("自分のエナジーが増えると高評価になる", () => {
    const game = GameFactory.createSampleGame();

    const player = game.player1;

    const baseScore = GameStateEvaluator.evaluate(game, player.id);

    const card = player.board.hand.shift();

    if (!card) {
      throw new Error("手札が空です");
    }

    player.board.energyLine[0].setCard(card);

    const afterEnergyScore = GameStateEvaluator.evaluate(game, player.id);

    expect(afterEnergyScore).toBeGreaterThan(baseScore);
  });
  it("相手のエナジーが増えると低評価になる", () => {
    const game = GameFactory.createSampleGame();

    const player = game.player1;
    const opponent = game.player2;

    const baseScore = GameStateEvaluator.evaluate(game, player.id);

    const card = opponent.board.hand.shift();

    if (!card) {
      throw new Error("相手の手札が空です");
    }

    opponent.board.energyLine[0].setCard(card);

    const afterOpponentEnergyScore = GameStateEvaluator.evaluate(
      game,
      player.id
    );

    expect(afterOpponentEnergyScore).toBeLessThan(baseScore);
  });
});