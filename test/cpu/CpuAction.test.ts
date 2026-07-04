import { describe, expect, it } from "vitest";

import { createTestGame } from "../helpers/createTestGame";
import { TestCardFactory } from "../helpers/TestCardFactory";
import { advanceToMovePhase, advanceToMainPhase, advanceToAttackPhase } from "../helpers/gamePhaseHelper";

import { CpuActionGenerator } from "../../gameEngine/cpu/CpuActionGenerator";
import { CpuActionExecutor } from "../../gameEngine/cpu/CpuActionExecutor";
import { BoardLine } from "../../gameEngine/enum/BoardLine";
import { GamePhase } from "../../gameEngine/enum/GamePhase";
import { CardType } from "../../gameEngine/enum/CardType";

describe("CPU action system", () => {
  it("Moveフェーズではエナジーラインからフロントラインへの移動候補を生成する", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMovePhase(game);

    const card = TestCardFactory.createCharacter({
      name: "移動キャラ",
      bp: 3000,
    });

    player.board.energyLine[0].setCard(card);

    const actions = CpuActionGenerator.generate(game);

    expect(actions).toContainEqual({
      type: "move",
      fromLine: BoardLine.EnergyLine,
      fromIndex: 0,
      toLine: BoardLine.FrontLine,
      toIndex: 0,
    });

    expect(actions).toContainEqual({ type: "endPhase" });
  });

  it("Moveフェーズではstep持ちのフロントラインからエナジーラインへの移動候補を生成する", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMovePhase(game);

    const card = TestCardFactory.createCharacter({
      name: "ステップ持ち",
      bp: 3000,
      keywords: [{ type: "step" }],
    });

    player.board.frontLine[0].setCard(card);

    const actions = CpuActionGenerator.generate(game);

    expect(actions).toContainEqual({
      type: "move",
      fromLine: BoardLine.FrontLine,
      fromIndex: 0,
      toLine: BoardLine.EnergyLine,
      toIndex: 0,
    });
  });

  it("Mainフェーズでは手札のキャラを登場させる候補を生成する", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);

    const character = TestCardFactory.createCharacter({
      name: "手札キャラ",
      bp: 3000,
    });

    player.board.hand.splice(0, player.board.hand.length);
    player.board.hand.push(character);

    const actions = CpuActionGenerator.generate(game);

    expect(actions).toContainEqual({
      type: "playCard",
      handIndex: 0,
      destination: BoardLine.FrontLine,
    });

    expect(actions).toContainEqual({
      type: "playCard",
      handIndex: 0,
      destination: BoardLine.EnergyLine,
    });
  });

  it("Attackフェーズではアクティブなフロントキャラの攻撃候補を生成する", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "攻撃キャラ",
      bp: 3000,
    });

    player.board.frontLine[0].setCard(attacker);

    const actions = CpuActionGenerator.generate(game);

    expect(actions).toContainEqual({
      type: "attack",
      attackerIndex: 0,
      attackTarget: { type: "player" },
    });
  });

  it("Attackフェーズでは狙い撃ち持ちの相手フロント指定攻撃候補を生成する", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    advanceToAttackPhase(game);

    const attacker = TestCardFactory.createCharacter({
      name: "狙い撃ち持ち",
      bp: 3000,
      keywords: [{ type: "snipe" }],
    });

    const target = TestCardFactory.createCharacter({
      name: "対象",
      bp: 2000,
    });

    player.board.frontLine[0].setCard(attacker);
    opponent.board.frontLine[1].setCard(target);

    const actions = CpuActionGenerator.generate(game);

    expect(actions).toContainEqual({
      type: "attack",
      attackerIndex: 0,
      attackTarget: {
        type: "frontLineCharacter",
        index: 1,
      },
    });
  });

  it("Executorはmoveアクションを実行できる", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMovePhase(game);

    const card = TestCardFactory.createCharacter({
      name: "移動キャラ",
      bp: 3000,
    });

    player.board.energyLine[0].setCard(card);

    CpuActionExecutor.execute(game, {
      type: "move",
      fromLine: BoardLine.EnergyLine,
      fromIndex: 0,
      toLine: BoardLine.FrontLine,
      toIndex: 0,
    });

    expect(player.board.energyLine[0].isEmpty()).toBe(true);
    expect(player.board.frontLine[0].getCard()).toBe(card);
  });

  it("ExecutorはendPhaseアクションでフェーズを進める", () => {
    const game = createTestGame();

    advanceToMainPhase(game);
    expect(game.phase).toBe(GamePhase.Main);

    CpuActionExecutor.execute(game, {
      type: "endPhase",
    });

    expect(game.phase).not.toBe(GamePhase.Main);
  });

  it("tryExecuteは不正なアクションでfalseを返す", () => {
    const game = createTestGame();

    advanceToMovePhase(game);

    const result = CpuActionExecutor.tryExecute(game, {
      type: "move",
      fromLine: BoardLine.EnergyLine,
      fromIndex: 0,
      toLine: BoardLine.FrontLine,
      toIndex: 0,
    });

    expect(result).toBe(false);
  });
});