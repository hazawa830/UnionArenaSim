import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { advanceToMainPhase } from "./helpers/gamePhaseHelper";

import { CardFactory } from "../gameEngine/cards/CardFactory";
import { CardInstance } from "../gameEngine/cards/CardInstance";
import { UseEventCardAction } from "../gameEngine/actions/UseEventCardAction";
import { Effect } from "../gameEngine/effects/Effect";
import { EffectTrigger } from "../gameEngine/effects/EffectTrigger";

describe("UseEventCardAction", () => {
  it("Mainフェーズでイベントカードを使用し、APを2回復してトラッシュへ置く", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);

    // requiredEnergy red:3 を満たすため、赤エナジーを3つ用意
    player.board.energyLine[0].setCard(
      new CardInstance(
        910001,
        CardFactory.create({
          id: "TEST-ENERGY-1",
          name: "赤エナジー1",
          cardType: "character",
          requiredEnergy: {},
          actionPointCost: 1,
          bp: 1000,
          generatedEnergy: { red: 1 },
          triggerType: "none",
          effects: [],
        })
      )
    );

    player.board.energyLine[1].setCard(
      new CardInstance(
        910002,
        CardFactory.create({
          id: "TEST-ENERGY-2",
          name: "赤エナジー2",
          cardType: "character",
          requiredEnergy: {},
          actionPointCost: 1,
          bp: 1000,
          generatedEnergy: { red: 1 },
          triggerType: "none",
          effects: [],
        })
      )
    );

    player.board.energyLine[2].setCard(
      new CardInstance(
        910003,
        CardFactory.create({
          id: "TEST-ENERGY-3",
          name: "赤エナジー3",
          cardType: "character",
          requiredEnergy: {},
          actionPointCost: 1,
          bp: 1000,
          generatedEnergy: { red: 1 },
          triggerType: "none",
          effects: [],
        })
      )
    );

    const effects: Effect[] = [
      {
        trigger: EffectTrigger.OnUse,
        actions: [
          {
            type: "activate",
            target: {
              side: "own",
              zone: "ap",
              maxCount: 2,
            },
          },
        ],
      },
    ];

    const eventCard = new CardInstance(
      920001,
      CardFactory.create({
        id: "EX13BT-GIM-2-067",
        name: "お母さんか！",
        cardType: "event",
        requiredEnergy: { red: 3 },
        actionPointCost: 1,
        generatedEnergy: {},
        triggerType: "final",
        effects,
      })
    );

    player.board.hand.unshift(eventCard);

    player.board.setActionPoint(1);
    player.board.maxActionPoint = 3;

    const handBefore = player.board.hand.length;
    const trashBefore = player.board.trash.length;

    UseEventCardAction.execute(game, 0);

    // 使用コストでAP-1、その後効果でAP+2。最大3なので結果は2
    expect(player.board.activeActionPoint).toBe(2);

    expect(player.board.hand.length).toBe(handBefore - 1);
    expect(player.board.trash.length).toBe(trashBefore + 1);
    expect(player.board.trash).toContain(eventCard);
  });

  it("Mainフェーズ以外ではイベントカードを使用できない", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    const eventCard = new CardInstance(
      920002,
      CardFactory.create({
        id: "TEST-EVENT",
        name: "テストイベント",
        cardType: "event",
        requiredEnergy: {},
        actionPointCost: 1,
        generatedEnergy: {},
        triggerType: "none",
        effects: [],
      })
    );

    player.board.hand.unshift(eventCard);

    expect(() => {
      UseEventCardAction.execute(game, 0);
    }).toThrow("Event card can only be used in main phase.");
  });

  it("イベントカード以外は使用できない", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);

    const characterCard = new CardInstance(
      920003,
      CardFactory.create({
        id: "TEST-CHARACTER",
        name: "テストキャラ",
        cardType: "character",
        requiredEnergy: {},
        actionPointCost: 1,
        bp: 1000,
        generatedEnergy: { red: 1 },
        triggerType: "none",
        effects: [],
      })
    );

    player.board.hand.unshift(characterCard);

    expect(() => {
      UseEventCardAction.execute(game, 0);
    }).toThrow("Selected card is not an event card.");
  });
});