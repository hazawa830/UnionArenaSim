import { describe, it, expect } from "vitest";
import { PlayCardAction} from "../gameEngine/actions/PlayCardAction";
import { EnergyColor } from "../gameEngine/enum/EnergyColor";
import { createTestGame } from "./helpers/createTestGame";
import {advanceToMainPhase,} from "./helpers/gamePhaseHelper";
import { BoardLine } from "../gameEngine/enum/BoardLine";
import { LogType } from "../gameEngine/enum/LogType";
import { GamePhase } from "../gameEngine/enum/GamePhase";
import { ActionSource } from "../gameEngine/enum/ActionSource";
describe("PlayCardAction", () => {
  it("手札のカードをエナジーラインとフロントラインにプレイできる", () => {
    const game = createTestGame();

    const currentPlayer = game.getCurrentPlayer();
    expect(currentPlayer.board.hand.length).toBe(7);
    expect(currentPlayer.board.deck.length).toBe(36);
    expect(currentPlayer.board.lifeArea.length).toBe(7);
    expect(currentPlayer.board.activeActionPoint).toBe(1);
    advanceToMainPhase(game);
    currentPlayer.board.setActionPoint(3);
    PlayCardAction.execute(game, 0, BoardLine.EnergyLine);

    expect(currentPlayer.board.hand.length).toBe(6);
    expect(currentPlayer.board.energyLine[0].getCard()?.card.name).toBe("ロキ");
    expect(currentPlayer.board.activeActionPoint).toBe(2);

    PlayCardAction.execute(game, 0, BoardLine.FrontLine);

    expect(currentPlayer.board.hand.length).toBe(5);
    expect(currentPlayer.board.frontLine[0].getCard()?.card.name).toBe("ロキ");
    expect(currentPlayer.board.getGeneratedEnergy().get(EnergyColor.Blue)).toBe(1);
    expect(currentPlayer.board.activeActionPoint).toBe(1);
  });
  it("カードをプレイするとPlayCardログが追加される", () => {
    const game = createTestGame();

    // Mainフェーズへ
    advanceToMainPhase(game);

    const player = game.getCurrentPlayer();

    // テスト対象カード
    const card = player.board.hand[0];

    PlayCardAction.execute(
      game,
      0,
      BoardLine.FrontLine
    );

    

    const log = game.logs[2];

    expect(log.type).toBe(LogType.PlayCard);
    expect(log.playerId).toBe(player.id);
    expect(log.turn).toBe(game.turnCount);
    expect(log.phase).toBe(GamePhase.Main);

    expect(log.message).toContain(card.card.name);

    expect(log.payload).toMatchObject({
      cardId: card.card.id,
      instanceId: card.instanceId,
      destination: BoardLine.FrontLine,
    });
  });
  it("効果による登場はActionSourceがEffectとしてログに記録される", () => {
  const game = createTestGame();

  advanceToMainPhase(game);

  const player = game.getCurrentPlayer();
  const card = player.board.hand[0];

  PlayCardAction.execute(
    game,
    0,
    BoardLine.FrontLine,
    ActionSource.CardEffect
  );

  expect(game.logs).toHaveLength(3);

  const log = game.logs[2];

  expect(log.type).toBe(LogType.PlayCard);

  expect(log.payload).toMatchObject({
    cardId: card.card.id,
    instanceId: card.instanceId,
    destination: BoardLine.FrontLine,
    source: ActionSource.CardEffect,
    isRest: false,
  });
});
});