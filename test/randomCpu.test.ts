import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { RandomCPU } from "../gameEngine/cpu/RandomCPU";
import { GamePhase } from "../gameEngine/enum/GamePhase";
import { BoardLine } from "../gameEngine/enum/BoardLine";
import { PlayCardAction } from "../gameEngine/actions/PlayCardAction";
import { advanceToMainPhase } from "./helpers/gamePhaseHelper";

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
  it("ブロック可能なキャラがいない場合はundefinedを返す", () => {
    const game = createTestGame();

    const blockerIndex = RandomCPU.chooseBlockerIndex(game);

    expect(blockerIndex).toBeUndefined();
  });
  it("ブロック可能なキャラがいる場合はundefinedまたは有効なindexを返す", () => {
    const game = createTestGame();

    const currentPlayer = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    // 自分のターンで相手にキャラを直接配置
    advanceToMainPhase(game);

    const blocker = opponent.board.hand[0];
    opponent.board.hand.splice(0, 1);

    blocker.isRest = false;
    opponent.board.frontLine[2].setCard(blocker);

    const blockerIndex = RandomCPU.chooseBlockerIndex(game);

    expect(
        blockerIndex === undefined ||
        (blockerIndex >= 0 && blockerIndex < 4)
    ).toBe(true);
    });
    it("StartフェーズでCPUはランダムにエクストラドローしてMoveフェーズへ進む", () => {
  const game = createTestGame();
  const player = game.getCurrentPlayer();

  const handBefore = player.board.hand.length;
  const deckBefore = player.board.deck.length;
  const apBefore = player.board.activeActionPoint;

  RandomCPU.playPhase(game);

  expect(game.phase).toBe(GamePhase.Move);

  const didExtraDraw = player.board.hand.length === handBefore + 1;

  if (didExtraDraw) {
    expect(player.board.deck.length).toBe(deckBefore - 1);
    expect(player.board.activeActionPoint).toBe(apBefore - 1);
  } else {
    expect(player.board.hand.length).toBe(handBefore);
    expect(player.board.deck.length).toBe(deckBefore);
    expect(player.board.activeActionPoint).toBe(apBefore);
  }
});
});