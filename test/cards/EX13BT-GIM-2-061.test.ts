import { describe, it, expect } from "vitest";

import { createTestGame } from "../helpers/createTestGame";
import { TestCardFactory } from "../helpers/TestCardFactory";
import { advanceToMainPhase } from "../helpers/gamePhaseHelper";

import { BoardLine } from "../../gameEngine/enum/BoardLine";
import { Effect } from "../../gameEngine/effects/Effect";
import { EffectTrigger } from "../../gameEngine/effects/EffectTrigger";
import { ActivateMainEffectAction } from "../../gameEngine/actions/ActivateMainEffectAction";
import { LogType } from "../../gameEngine/enum/LogType";
import { EffectLogType } from "../../gameEngine/enum/EffectLogType";
import { ModifyBpThisTurnEffectAction } from "../../gameEngine/effects/actions/ModifyBpThisTurnEffectAction";
function createTemari061() {
  const effects: Effect[] = [
    {
      id: "activate-main-discard-bp-plus-1500",
      trigger: EffectTrigger.ActivateMain,
      oncePerTurn: {
        scope: "instance",
      },
      costs: [
        {
          type: "discardHand",
          count: 1,
        },
      ],
      actions: [
        {
          type: "modifyBpThisTurn",
          target: "self",
          amount: 1500,
        },
      ],
    },
  ];

  return TestCardFactory.createCharacter({
    name: "月村 手毬",
    bp: 1500,
    effects,
  });
}

describe("EX13BT-GIM-2-061 月村 手毬", () => {
  it("起動メインで手札を1枚捨て、このキャラのBPをこのターン中+1500する", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);

    const temari = createTemari061();
    const discardCard = TestCardFactory.createCharacter({
      name: "捨てる手札",
      bp: 1000,
    });

    player.board.hand.splice(0, player.board.hand.length);
    player.board.hand.push(discardCard);

    player.board.frontLine[0].setCard(temari);

    ActivateMainEffectAction.execute(game, BoardLine.FrontLine, 0);

    expect(temari.temporaryBpBonus).toBe(1500);
    expect(player.board.hand).not.toContain(discardCard);
    expect(player.board.trash).toContain(discardCard);
  });

  it("ターン1なので同じターン中に2回発動しない", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);

    const temari = createTemari061();

    const discardCard1 = TestCardFactory.createCharacter({
      name: "捨てる手札1",
      bp: 1000,
    });

    const discardCard2 = TestCardFactory.createCharacter({
      name: "捨てる手札2",
      bp: 1000,
    });

    player.board.hand.splice(0, player.board.hand.length);
    player.board.hand.push(discardCard1, discardCard2);

    player.board.frontLine[0].setCard(temari);

    ActivateMainEffectAction.execute(game, BoardLine.FrontLine, 0);
    ActivateMainEffectAction.execute(game, BoardLine.FrontLine, 0);

    expect(temari.temporaryBpBonus).toBe(1500);
    expect(player.board.trash).toContain(discardCard1);
    expect(player.board.trash).not.toContain(discardCard2);
    expect(player.board.hand).toContain(discardCard2);
  });

  it("手札がない場合はコストを払えず、BPも上がらない", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);

    const temari = createTemari061();

    player.board.hand.splice(0, player.board.hand.length);
    player.board.frontLine[0].setCard(temari);

    expect(() => {
      ActivateMainEffectAction.execute(game, BoardLine.FrontLine, 0);
    }).toThrow("Not enough hand cards to pay discardHand cost.");

    expect(temari.temporaryBpBonus).toBe(0);
  });

  it("modifyBpThisTurnでBPを上げるとEffectログが追加される", () => {
  const game = createTestGame();
  const actor = game.getCurrentPlayer();
  const opponent = game.getOpponentPlayer();

  const source = TestCardFactory.createCharacter({
    name: "効果元",
    bp: 3000,
  });

  const context = {
    game,
    source,
    actor,
    opponent,
  };

  ModifyBpThisTurnEffectAction.execute(context, {
    type: "modifyBpThisTurn",
    target: "self",
    amount: 1500,
  });

  expect(source.temporaryBpBonus).toBe(1500);
  expect(game.logs).toHaveLength(1);

  const log = game.logs[0];

  expect(log.type).toBe(LogType.Effect);
  expect(log.playerId).toBe(actor.id);
  expect(log.message).toContain("効果元");

  expect(log.payload).toMatchObject({
    effectType: EffectLogType.ModifyBpThisTurn,

    sourceInstanceId: source.instanceId,
    sourceCardId: source.card.id,
    sourceCardName: source.card.name,

    targetInstanceId: source.instanceId,
    targetCardId: source.card.id,
    targetCardName: source.card.name,

    amount: 1500,
    temporaryBpBonus: 1500,
  });
});
});