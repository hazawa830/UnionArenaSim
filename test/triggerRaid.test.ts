import { describe, expect, it } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { TestCardFactory } from "./helpers/TestCardFactory";

import { TriggerAction } from "../gameEngine/actions/TriggerAction";
import { CardFactory } from "../gameEngine/cards/CardFactory";
import { CardInstance } from "../gameEngine/cards/CardInstance";
import { TriggerType } from "../gameEngine/enum/TriggerType";
import { EffectTrigger } from "../gameEngine/effects/EffectTrigger";
import { LogType } from "../gameEngine/enum/LogType";
import { ResolveRaidTriggerAction } from "../gameEngine/actions/ResolveRaidTriggerAction";
import { BoardLine } from "../gameEngine/enum/BoardLine";
function createRedEnergy(name: string) {
  return TestCardFactory.createCharacter({
    name,
    bp: 1000,
    generatedEnergy: { red: 1 },
  });
}

function setupRed4Energy(player: any) {
  player.board.energyLine[0].setCard(createRedEnergy("赤1"));
  player.board.energyLine[1].setCard(createRedEnergy("赤2"));
  player.board.energyLine[2].setCard(createRedEnergy("赤3"));
  player.board.energyLine[3].setCard(createRedEnergy("赤4"));
}

function createRaidTemari(): CardInstance {
  const card = CardFactory.create({
    id: "UA27BT-GIM-1-063",
    name: "月村 手毬",
    imagePath: "/card-images/UA34BT_CGD-1-041.png",
    cardType: "character",
    requiredEnergy: { red: 4 },
    actionPointCost: 1,
    bp: 4000,
    generatedEnergy: { red: 1 },
    triggerType: "raid",
    raidConditions: [
      {
        type: "cardName",
        names: ["月村 手毬"],
      },
    ],
    keywords: [],
    raidKeywords: [{ type: "impact", value: 1 }],
    effects: [],
    raidEffects: [
      {
        id: "raid-draw",
        trigger: EffectTrigger.OnPlay,
        conditions: [
          {
            type: "hasCharacterNamesOnField",
            names: ["花海 咲季", "藤田 ことね"],
            mode: "all",
          },
        ],
        actions: [{ type: "draw", count: 1 }],
      },
    ],
  });

  return new CardInstance(9999, card);
}

describe("TriggerAction Raid", () => {
  it("レイド可能ならpendingRaidTriggerが設定される", () => {
    const game = createTestGame();
    const damagedPlayer = game.getCurrentPlayer();
    const opponentPlayer = game.getOpponentPlayer();

    setupRed4Energy(damagedPlayer);

    const base = TestCardFactory.createCharacter({
      name: "月村 手毬",
      bp: 1500,
    });

    const raid = createRaidTemari();

    damagedPlayer.board.frontLine[0].setCard(base);

    TriggerAction.resolve(game, raid, damagedPlayer, opponentPlayer);

    expect(game.pendingRaidTrigger).toEqual({
      revealedCard: raid,
      playerId: damagedPlayer.id,
      opponentPlayerId: opponentPlayer.id,
    });

    expect(damagedPlayer.board.frontLine[0].getCard()).toBe(base);
    expect(raid.raidBase).toBeUndefined();
  });

  it("レイド条件を満たさない場合は手札に加える", () => {
    const game = createTestGame();
    const damagedPlayer = game.getCurrentPlayer();
    const opponentPlayer = game.getOpponentPlayer();

    setupRed4Energy(damagedPlayer);

    const base = TestCardFactory.createCharacter({
      name: "花海 咲季",
      bp: 1500,
    });

    const raid = createRaidTemari();

    damagedPlayer.board.frontLine[0].setCard(base);

    TriggerAction.resolve(game, raid, damagedPlayer, opponentPlayer);

    expect(game.pendingRaidTrigger).toBeUndefined();
    expect(damagedPlayer.board.frontLine[0].getCard()).toBe(base);
    expect(damagedPlayer.board.hand).toContain(raid);
    expect(raid.isRaid()).toBe(false);
  });

  it("必要エナジーを満たさない場合は手札に加える", () => {
    const game = createTestGame();
    const damagedPlayer = game.getCurrentPlayer();
    const opponentPlayer = game.getOpponentPlayer();

    damagedPlayer.board.energyLine[0].setCard(createRedEnergy("赤1"));

    const base = TestCardFactory.createCharacter({
      name: "月村 手毬",
      bp: 1500,
    });

    const raid = createRaidTemari();

    damagedPlayer.board.frontLine[0].setCard(base);

    TriggerAction.resolve(
      game,
      raid,
      damagedPlayer,
      opponentPlayer
    );

    expect(damagedPlayer.board.frontLine[0].getCard()).toBe(base);
    expect(damagedPlayer.board.hand).toContain(raid);
    expect(raid.isRaid()).toBe(false);
  });

  it("レイドトリガーでレイド登場した場合、raidEffectsのOnPlayが発動する", () => {
    const game = createTestGame();
    const damagedPlayer = game.getCurrentPlayer();
    const opponentPlayer = game.getOpponentPlayer();

    setupRed4Energy(damagedPlayer);

    const base = TestCardFactory.createCharacter({
      name: "月村 手毬",
      bp: 1500,
    });

    const saki = TestCardFactory.createCharacter({
      name: "花海 咲季",
      bp: 3000,
    });

    const kotone = TestCardFactory.createCharacter({
      name: "藤田 ことね",
      bp: 3000,
    });

    const raid = createRaidTemari();

    damagedPlayer.board.frontLine[0].setCard(base);
    damagedPlayer.board.frontLine[1].setCard(saki);
    damagedPlayer.board.frontLine[2].setCard(kotone);

    const handBefore = damagedPlayer.board.hand.length;
    const deckBefore = damagedPlayer.board.deck.length;

    TriggerAction.resolve(
      game,
      raid,
      damagedPlayer,
      opponentPlayer
    );

    expect(damagedPlayer.board.frontLine[0].getCard()).toBe(raid);
    expect(raid.isRaid()).toBe(true);

    expect(damagedPlayer.board.hand.length).toBe(handBefore + 1);
    expect(damagedPlayer.board.deck.length).toBe(deckBefore - 1);
  });
it("レイドトリガー公開時にTriggerログが追加される", () => {
  const game = createTestGame();
  const damagedPlayer = game.getCurrentPlayer();
  const opponentPlayer = game.getOpponentPlayer();

  setupRed4Energy(damagedPlayer);

  const base = TestCardFactory.createCharacter({
    name: "月村 手毬",
    bp: 1500,
  });

  const raid = createRaidTemari();

  damagedPlayer.board.frontLine[0].setCard(base);

  TriggerAction.resolve(game, raid, damagedPlayer, opponentPlayer);

  expect(resultLog?.payload).toMatchObject({
    result: "pendingRaidChoice",
    cardInstanceId: raid.instanceId,
    cardId: raid.card.id,
  });

  expect(game.logs[0].payload).toMatchObject({
    cardInstanceId: raid.instanceId,
    cardId: raid.card.id,
    cardName: raid.card.name,
    triggerType: raid.card.triggerType,
  });
});
it("レイドトリガー成功時にTriggerResultログが追加される", () => {
  const game = createTestGame();
  const damagedPlayer = game.getCurrentPlayer();
  const opponentPlayer = game.getOpponentPlayer();

  setupRed4Energy(damagedPlayer);

  const base = TestCardFactory.createCharacter({
    name: "月村 手毬",
    bp: 1500,
  });

  const raid = createRaidTemari();

  damagedPlayer.board.frontLine[0].setCard(base);

  TriggerAction.resolve(game, raid, damagedPlayer, opponentPlayer);

  const resultLog = game.logs.find(
    (log) => log.type === LogType.TriggerResult
  );

  expect(resultLog).toBeDefined();

  expect(resultLog?.payload).toMatchObject({
    result: "raidPlay",
    cardInstanceId: raid.instanceId,
    cardId: raid.card.id,
    baseInstanceId: base.instanceId,
    baseCardId: base.card.id,
    isRest: false,
  });
});
it("レイドできない場合は手札に加わりTriggerResultログに理由が残る", () => {
  const game = createTestGame();
  const damagedPlayer = game.getCurrentPlayer();
  const opponentPlayer = game.getOpponentPlayer();

  const raid = createRaidTemari();

  TriggerAction.resolve(game, raid, damagedPlayer, opponentPlayer);

  expect(damagedPlayer.board.hand).toContain(raid);

  const resultLog = game.logs.find(
    (log) => log.type === LogType.TriggerResult
  );

  expect(resultLog?.payload).toMatchObject({
    result: "addToHand",
    reason: "notEnoughEnergy",
    cardId: raid.card.id,
  });
});
});