import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { RandomCPU } from "../gameEngine/cpu/RandomCPU";
import { GamePhase } from "../gameEngine/enum/GamePhase";

describe("RandomCPU", () => {
  it("StartフェーズをMoveフェーズへ進められる", () => {
    const game = createTestGame();

    expect(game.phase).toBe(GamePhase.Start);

    RandomCPU.playPhase(game);

    expect(game.phase).toBe(GamePhase.Move);
  });

  it("Mainフェーズで1枚目はエナジーラインにプレイする", () => {
    const game = createTestGame();

    game.nextPhase(); // Start -> Move
    game.nextPhase(); // Move -> Main

    const currentPlayer = game.getCurrentPlayer();

    RandomCPU.playPhase(game);

    expect(game.phase).toBe(GamePhase.Attack);
    expect(currentPlayer.board.hand.length).toBe(6);
    expect(currentPlayer.board.energyLine.some((slot) => !slot.isEmpty())).toBe(true);
    expect(currentPlayer.board.frontLine.every((slot) => slot.isEmpty())).toBe(true);
  });

  it("エナジーがある状態ではフロントラインにプレイする", () => {
    const game = createTestGame();

    game.nextPhase(); // Start -> Move
    game.nextPhase(); // Move -> Main

    const currentPlayer = game.getCurrentPlayer();
    currentPlayer.board.setActionPoint(3);
    
    game.phase = GamePhase.Main;

    RandomCPU.playPhase(game); // 2枚目：フロントラインへ

    expect(game.phase).toBe(GamePhase.Attack);
    expect(currentPlayer.board.hand.length).toBe(4);
    expect(currentPlayer.board.energyLine.some((slot) => !slot.isEmpty())).toBe(true);
    expect(currentPlayer.board.frontLine.some((slot) => !slot.isEmpty())).toBe(true);
  });

  it("Attackフェーズでフロントラインのカードが攻撃し、相手ライフが減る", () => {
    const game = createTestGame();

    game.nextPhase(); // Start -> Move
    game.nextPhase(); // Move -> Main

    const currentPlayer = game.getCurrentPlayer();
    const opponentPlayer = game.getOpponentPlayer();
    currentPlayer.board.setActionPoint(3);
    opponentPlayer.board.setActionPoint(3);
    game.phase = GamePhase.Main;
    RandomCPU.playPhase(game); // 2枚目：フロントラインへ
    currentPlayer.board.activateAllCards();
    expect(game.phase).toBe(GamePhase.Attack);

    const lifeBefore = opponentPlayer.board.lifeArea.length;

    RandomCPU.playPhase(game);

    expect(game.phase).toBe(GamePhase.End);
    expect(opponentPlayer.board.lifeArea.length).toBe(lifeBefore - 2);
    expect(currentPlayer.board.frontLine[0].getCard()?.isRest).toBe(true);
  });

  it("Endフェーズを次プレイヤーのStartフェーズへ進められる", () => {
    const game = createTestGame();

    const beforePlayer = game.getCurrentPlayer();

    game.phase = GamePhase.End;

    RandomCPU.playPhase(game);

    expect(game.phase).toBe(GamePhase.Start);
    expect(game.getCurrentPlayer()).not.toBe(beforePlayer);
  });
});