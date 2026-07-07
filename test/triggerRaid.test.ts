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

  
});