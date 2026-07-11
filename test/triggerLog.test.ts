import { describe, expect, it } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { TestCardFactory } from "./helpers/TestCardFactory";

import { TriggerAction } from "../gameEngine/actions/TriggerAction";
import { TriggerType } from "../gameEngine/enum/TriggerType";
import { LogType } from "../gameEngine/enum/LogType";
import { ResolveTriggerChoiceAction } from "../gameEngine/actions/ResolveTriggerChoiceAction";

describe("TriggerAction logs", () => {
  it("DrawトリガーでTriggerログとTriggerResultログが追加される", () => {
    const game = createTestGame();
    const damagedPlayer = game.getCurrentPlayer();
    const opponentPlayer = game.getOpponentPlayer();

    const triggerCard = TestCardFactory.createTriggerCard(TriggerType.Draw, {
      name: "ドロートリガー",
    });

    TriggerAction.resolve(game, triggerCard, damagedPlayer, opponentPlayer);

    expect(game.logs.map((log) => log.type)).toEqual([
      LogType.Trigger,
      LogType.TriggerResult,
    ]);

    expect(game.logs[0].payload).toMatchObject({
      cardInstanceId: triggerCard.instanceId,
      cardId: triggerCard.card.id,
      cardName: triggerCard.card.name,
      triggerType: TriggerType.Draw,
    });

    expect(game.logs[1].payload).toMatchObject({
      result: "draw",
      count: 1,
      cardId: triggerCard.card.id,
      triggerType: TriggerType.Draw,
    });
  });

  it("Activeトリガーで対象情報付きのTriggerResultログが追加される", () => {
    const game = createTestGame();
    const damagedPlayer = game.getCurrentPlayer();
    const opponentPlayer = game.getOpponentPlayer();

    const target = TestCardFactory.createCharacter({
      name: "BP上昇対象",
      bp: 3000,
    });

    const triggerCard = TestCardFactory.createTriggerCard(TriggerType.Active, {
      name: "アクティブトリガー",
    });

    damagedPlayer.board.frontLine[0].setCard(target);

    TriggerAction.resolve(game, triggerCard, damagedPlayer, opponentPlayer);

    const resultLog = game.logs.find(
      (log) => log.type === LogType.TriggerResult
    );

    expect(resultLog?.payload).toMatchObject({
      result: "pendingActiveChoice",
    });
  });

  it("Colorトリガーで相手キャラを手札に戻した結果ログが追加される", () => {
  const game = createTestGame();
  const damagedPlayer = game.getCurrentPlayer();
  const opponentPlayer = game.getOpponentPlayer();

  const returnedTarget = TestCardFactory.createCharacter({
    name: "戻されるキャラ",
    bp: 3000,
  });

  const triggerCard = TestCardFactory.createTriggerCard(TriggerType.Color, {
    name: "カラートリガー",
    color: "blue",
  });

  opponentPlayer.board.frontLine[1].setCard(returnedTarget);

  TriggerAction.resolve(game, triggerCard, damagedPlayer, opponentPlayer);

  expect(game.pendingTriggerChoice).toBeDefined();
  expect(game.pendingTriggerChoice?.triggerType).toBe(TriggerType.Color);

  ResolveTriggerChoiceAction.execute(game, [returnedTarget]);

  expect(opponentPlayer.board.hand).toContain(returnedTarget);

  const resultLog = [...game.logs]
    .reverse()
    .find(
      (log) =>
        log.type === LogType.TriggerResult &&
        log.payload.result === "resolvedColorTrigger"
    );

  expect(resultLog?.payload).toMatchObject({
    result: "resolvedColorTrigger",
    color: "blue",
    effect: "returnToHand",
    returnedCardInstanceId: returnedTarget.instanceId,
    returnedCardId: returnedTarget.card.id,
    returnedCardName: returnedTarget.card.name,
    targetIndex: 1,
  });
});
it("Color赤トリガーは相手フロントラインのBP2500以下のキャラをトラッシュに送る", () => {
  const game = createTestGame();
  const damagedPlayer = game.getCurrentPlayer();
  const opponentPlayer = game.getOpponentPlayer();

  const destroyedTarget = TestCardFactory.createCharacter({
    name: "トラッシュに送られるキャラ",
    bp: 2500,
  });

  const triggerCard = TestCardFactory.createTriggerCard(TriggerType.Color, {
    name: "赤カラートリガー",
    color: "red",
  });

  opponentPlayer.board.frontLine[1].setCard(destroyedTarget);

  TriggerAction.resolve(game, triggerCard, damagedPlayer, opponentPlayer);

  expect(game.pendingTriggerChoice).toBeDefined();
  expect(game.pendingTriggerChoice?.triggerType).toBe(TriggerType.Color);

  ResolveTriggerChoiceAction.execute(game, [destroyedTarget]);

  expect(opponentPlayer.board.frontLine[1].isEmpty()).toBe(true);
  expect(opponentPlayer.board.trash).toContain(destroyedTarget);
  expect(damagedPlayer.board.trash).toContain(triggerCard);
});
  it("Noneトリガーで効果なし結果ログが追加される", () => {
    const game = createTestGame();
    const damagedPlayer = game.getCurrentPlayer();
    const opponentPlayer = game.getOpponentPlayer();

    const triggerCard = TestCardFactory.createTriggerCard(TriggerType.None, {
      name: "効果なしトリガー",
    });

    TriggerAction.resolve(game, triggerCard, damagedPlayer, opponentPlayer);

    expect(game.logs.map((log) => log.type)).toEqual([
      LogType.Trigger,
      LogType.TriggerResult,
    ]);

    expect(game.logs[1].payload).toMatchObject({
      result: "none",
      triggerType: TriggerType.None,
      cardId: triggerCard.card.id,
      cardName: triggerCard.card.name,
    });
  });
});