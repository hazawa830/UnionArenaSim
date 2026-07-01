import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { TestCardFactory } from "./helpers/TestCardFactory";
import { advanceToMainPhase } from "./helpers/gamePhaseHelper";

import { CardFactory } from "../gameEngine/cards/CardFactory";
import { CardInstance } from "../gameEngine/cards/CardInstance";
import { UseEventCardAction } from "../gameEngine/actions/UseEventCardAction";
import { Effect } from "../gameEngine/effects/Effect";
import { EffectTrigger } from "../gameEngine/effects/EffectTrigger";

describe("EX13BT-GIM-2-070 夏を満喫するわよ！", () => {
  it("条件を満たす場合、相手BP5000以下を退場させ、自分のキャラ1枚にBP+1000する", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    advanceToMainPhase(game);

    player.board.setActionPoint(3);

    // 使用条件: 自分の場に3名称を用意
    const saki = TestCardFactory.createCharacter({ name: "花海 咲季", bp: 3000 });
    const temari = TestCardFactory.createCharacter({ name: "月村 手毬", bp: 3000 });
    const kotone = TestCardFactory.createCharacter({ name: "藤田 ことね", bp: 3000 });

    player.board.frontLine[0].setCard(saki);
    player.board.frontLine[1].setCard(temari);
    player.board.energyLine[0].setCard(kotone);

    // red:4 を満たすため赤エナジーを合計4にする
    // saki red1, temari red1, kotone red1 想定では足りない場合があるので追加
    const redEnergy = TestCardFactory.createCharacter({
      name: "赤エナジー",
      bp: 1000,
    });
    player.board.energyLine[1].setCard(redEnergy);

    const opponentTarget = TestCardFactory.createCharacter({
      name: "退場対象",
      bp: 5000,
    });

    opponent.board.frontLine[0].setCard(opponentTarget);

    const effects: Effect[] = [
      {
        trigger: EffectTrigger.OnUse,
        conditions: [
          {
            type: "hasCharacterNamesOnField",
            names: ["花海 咲季", "月村 手毬", "藤田 ことね"],
            mode: "all",
          },
        ],
        actions: [
          {
            type: "destroy",
            target: {
              side: "opponent",
              zone: "frontLine",
              cardType: "character",
              maxCount: 1,
              maxBp: 5000,
            },
          },
          {
            type: "modifyBpThisTurn",
            amount: 1000,
            target: {
              side: "own",
              zone: "field",
              cardType: "character",
              maxCount: 1,
            },
          },
        ],
      },
    ];

    const eventCard = new CardInstance(
      930001,
      CardFactory.create({
        id: "EX13BT-GIM-2-070",
        name: "夏を満喫するわよ！",
        cardType: "event",
        requiredEnergy: {  },
        actionPointCost: 1,
        generatedEnergy: {},
        triggerType: "none",
        effects,
      })
    );

    player.board.hand.unshift(eventCard);

    const trashBefore = opponent.board.trash.length;

    UseEventCardAction.execute(game, 0);

    expect(opponent.board.frontLine[0].isEmpty()).toBe(true);
    expect(opponent.board.trash.length).toBe(trashBefore + 1);
    expect(opponent.board.trash).toContain(opponentTarget);

    // 自動選択なので、自分の場の先頭候補にBP+1000される
    expect(saki.temporaryBpBonus).toBe(1000);

    expect(player.board.trash).toContain(eventCard);
  });

  it("使用条件を満たさない場合、効果は解決されない", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    advanceToMainPhase(game);

    player.board.setActionPoint(3);

    // 条件をあえて不足させる
    const saki = TestCardFactory.createCharacter({ name: "花海 咲季", bp: 3000 });
    player.board.frontLine[0].setCard(saki);

    // red:4 用
    player.board.energyLine[0].setCard(
      TestCardFactory.createCharacter({ name: "赤1", bp: 1000 })
    );
    player.board.energyLine[1].setCard(
      TestCardFactory.createCharacter({ name: "赤2", bp: 1000 })
    );
    player.board.energyLine[2].setCard(
      TestCardFactory.createCharacter({ name: "赤3", bp: 1000 })
    );
    player.board.energyLine[3].setCard(
      TestCardFactory.createCharacter({ name: "赤4", bp: 1000 })
    );

    const opponentTarget = TestCardFactory.createCharacter({
      name: "退場しない対象",
      bp: 5000,
    });

    opponent.board.frontLine[0].setCard(opponentTarget);

    const effects: Effect[] = [
      {
        trigger: EffectTrigger.OnUse,
        conditions: [
          {
            type: "hasCharacterNamesOnField",
            names: ["花海 咲季", "月村 手毬", "藤田 ことね"],
            mode: "all",
          },
        ],
        actions: [
          {
            type: "destroy",
            target: {
              side: "opponent",
              zone: "frontLine",
              cardType: "character",
              maxCount: 1,
              maxBp: 5000,
            },
          },
          {
            type: "modifyBpThisTurn",
            amount: 1000,
            target: {
              side: "own",
              zone: "field",
              cardType: "character",
              maxCount: 1,
            },
          },
        ],
      },
    ];

    const eventCard = new CardInstance(
      930002,
      CardFactory.create({
        id: "EX13BT-GIM-2-070",
        name: "夏を満喫するわよ！",
        cardType: "event",
        requiredEnergy: { },
        actionPointCost: 1,
        generatedEnergy: {},
        triggerType: "none",
        effects,
      })
    );

    player.board.hand.unshift(eventCard);

    UseEventCardAction.execute(game, 0);

    expect(opponent.board.frontLine[0].getCard()).toBe(opponentTarget);
    expect(saki.temporaryBpBonus).toBe(0);

    // イベント自体は使用済みなのでトラッシュへ行く
    expect(player.board.trash).toContain(eventCard);
  });

  it("相手フロントラインのBPが5001以上の場合は退場させない", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    advanceToMainPhase(game);

    player.board.setActionPoint(3);

    const saki = TestCardFactory.createCharacter({ name: "花海 咲季", bp: 3000 });
    const temari = TestCardFactory.createCharacter({ name: "月村 手毬", bp: 3000 });
    const kotone = TestCardFactory.createCharacter({ name: "藤田 ことね", bp: 3000 });
    const redEnergy = TestCardFactory.createCharacter({ name: "赤エナジー", bp: 1000 });

    player.board.frontLine[0].setCard(saki);
    player.board.frontLine[1].setCard(temari);
    player.board.energyLine[0].setCard(kotone);
    player.board.energyLine[1].setCard(redEnergy);

    const highBpTarget = TestCardFactory.createCharacter({
      name: "高BP対象",
      bp: 6000,
    });

    opponent.board.frontLine[0].setCard(highBpTarget);

    const effects: Effect[] = [
      {
        trigger: EffectTrigger.OnUse,
        conditions: [
          {
            type: "hasCharacterNamesOnField",
            names: ["花海 咲季", "月村 手毬", "藤田 ことね"],
            mode: "all",
          },
        ],
        actions: [
          {
            type: "destroy",
            target: {
              side: "opponent",
              zone: "frontLine",
              cardType: "character",
              maxCount: 1,
              maxBp: 5000,
            },
          },
          {
            type: "modifyBpThisTurn",
            amount: 1000,
            target: {
              side: "own",
              zone: "field",
              cardType: "character",
              maxCount: 1,
            },
          },
        ],
      },
    ];

    const eventCard = new CardInstance(
      930003,
      CardFactory.create({
        id: "EX13BT-GIM-2-070",
        name: "夏を満喫するわよ！",
        cardType: "event",
        requiredEnergy: {},
        actionPointCost: 1,
        generatedEnergy: {},
        triggerType: "none",
        effects,
      })
    );

    player.board.hand.unshift(eventCard);

    UseEventCardAction.execute(game, 0);

    expect(opponent.board.frontLine[0].getCard()).toBe(highBpTarget);

    // 退場対象がいなくても、次のBP+1000は実行される想定
    expect(saki.temporaryBpBonus).toBe(1000);
  });
});