import { describe, expect, it } from "vitest";

import { createTestGame } from "../helpers/createTestGame";
import { TestCardFactory } from "../helpers/TestCardFactory";
import { advanceToMainPhase } from "../helpers/gamePhaseHelper";

import { RaidPlayAction } from "../../gameEngine/actions/RaidPlayAction";
import { BoardLine } from "../../gameEngine/enum/BoardLine";
import { CardFactory } from "../../gameEngine/cards/CardFactory";
import { CardInstance } from "../../gameEngine/cards/CardInstance";
import { EffectTrigger } from "../../gameEngine/effects/EffectTrigger";
import { Player } from "../../gameEngine/core/Player";

function createRedEnergy(name: string) {
  return TestCardFactory.createCharacter({
    name,
    bp: 1000,
    generatedEnergy: { red: 1 },
  });
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

    raidKeywords: [
      {
        type: "impact",
        value: 1,
      },
    ],

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
        actions: [
          {
            type: "draw",
            count: 1,
          },
        ],
      },
    ],
  });

  return new CardInstance(9999, card);
}

function setupRed4Energy(player: Player) {
  player.board.energyLine[0].setCard(createRedEnergy("赤1"));
  player.board.energyLine[1].setCard(createRedEnergy("赤2"));
  player.board.energyLine[2].setCard(createRedEnergy("赤3"));
  player.board.energyLine[3].setCard(createRedEnergy("赤4"));
}

function setOnlyHandCard(player: Player, card: CardInstance) {
  player.board.hand.splice(0, player.board.hand.length);
  player.board.hand.push(card);
}

describe("RaidPlayAction", () => {
  it("フロントラインのカードにレイドできる", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);
    player.board.setActionPoint(3);
    setupRed4Energy(player);

    const base = TestCardFactory.createCharacter({
      name: "月村 手毬",
      bp: 1500,
    });

    const raid = createRaidTemari();

    player.board.frontLine[0].setCard(base);
    setOnlyHandCard(player, raid);

    RaidPlayAction.execute(game, 0, BoardLine.FrontLine, 0);

    expect(player.board.frontLine[0].getCard()).toBe(raid);
    expect(raid.raidBase).toBe(base);
    expect(raid.isRaid()).toBe(true);
    expect(raid.isRest).toBe(false);

    expect(player.board.hand).not.toContain(raid);
    expect(player.board.activeActionPoint).toBe(2);
  });

  it("条件を満たさないカードにはレイドできない", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);
    player.board.setActionPoint(3);
    setupRed4Energy(player);

    const base = TestCardFactory.createCharacter({
      name: "花海 咲季",
      bp: 1500,
    });

    const raid = createRaidTemari();

    player.board.frontLine[0].setCard(base);
    setOnlyHandCard(player, raid);

    expect(() =>
      RaidPlayAction.execute(game, 0, BoardLine.FrontLine, 0)
    ).toThrow("Raid condition is not satisfied.");

    expect(player.board.frontLine[0].getCard()).toBe(base);
    expect(player.board.hand).toContain(raid);
  });

  it("エナジーラインからレイドしてフロントラインへ登場できる", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);
    player.board.setActionPoint(3);

    const base = TestCardFactory.createCharacter({
      name: "月村 手毬",
      bp: 1500,
      generatedEnergy: { red: 1 },
    });

    player.board.energyLine[0].setCard(base);
    player.board.energyLine[1].setCard(createRedEnergy("赤2"));
    player.board.energyLine[2].setCard(createRedEnergy("赤3"));
    player.board.energyLine[3].setCard(createRedEnergy("赤4"));

    const raid = createRaidTemari();
    setOnlyHandCard(player, raid);

    RaidPlayAction.execute(game, 0, BoardLine.EnergyLine, 0, 0);

    expect(player.board.energyLine[0].isEmpty()).toBe(true);
    expect(player.board.frontLine[0].getCard()).toBe(raid);

    expect(raid.raidBase).toBe(base);
    expect(raid.isRaid()).toBe(true);
    expect(raid.isRest).toBe(false);
    expect(player.board.activeActionPoint).toBe(2);
  });
});