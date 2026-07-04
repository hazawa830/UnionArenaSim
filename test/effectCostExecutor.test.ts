import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { TestCardFactory } from "./helpers/TestCardFactory";

import { EffectCostExecutor } from "../gameEngine/effects/EffectCostExecutor";
import { LogType } from "../gameEngine/enum/LogType";
import { EffectLogType } from "../gameEngine/enum/EffectLogType";

describe("EffectCostExecutor", () => {
  it("restSelf cost を払うと自身がレストになる", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    const source = TestCardFactory.createCharacter({
      name: "コスト支払い元",
      bp: 3000,
    });

    source.isRest = false;

    const context = {
      game,
      source,
      actor: player,
      opponent,
    };

    EffectCostExecutor.payCosts(context, [
      {
        type: "restSelf",
      },
    ]);

    expect(source.isRest).toBe(true);
  });

  it("レスト済みだと restSelf cost は払えない", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    const source = TestCardFactory.createCharacter({
      name: "レスト済みコスト元",
      bp: 3000,
    });

    source.isRest = true;

    const context = {
      game,
      source,
      actor: player,
      opponent,
    };

    expect(() => {
      EffectCostExecutor.payCosts(context, [
        {
          type: "restSelf",
        },
      ]);
    }).toThrow("Rested card cannot pay restSelf cost.");
  });

  it("discardHand cost を払うと手札が1枚トラッシュへ行く", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    const source = TestCardFactory.createCharacter({
      name: "コスト支払い元",
      bp: 3000,
    });

    const discardCard = TestCardFactory.createCharacter({
      name: "捨てる手札",
      bp: 1000,
    });

    player.board.hand.splice(0, player.board.hand.length);
    player.board.hand.push(discardCard);

    const context = {
      game,
      source,
      actor: player,
      opponent,
    };

    EffectCostExecutor.payCosts(context, [
      {
        type: "discardHand",
        count: 1,
      },
    ]);

    expect(player.board.hand).not.toContain(discardCard);
    expect(player.board.trash).toContain(discardCard);
  });
  it("discardHand cost を払うと捨てたカードのEffectログが追加される", () => {
  const game = createTestGame();
  const actor = game.getCurrentPlayer();
  const opponent = game.getOpponentPlayer();

  const source = TestCardFactory.createCharacter({
    name: "効果元",
    bp: 3000,
  });

  const discarded = TestCardFactory.createCharacter({
    name: "捨てるカード",
    bp: 1000,
  });

  actor.board.hand.splice(0, actor.board.hand.length);
  actor.board.hand.push(discarded);

  const context = {
    game,
    source,
    actor,
    opponent,
  };

  EffectCostExecutor.payCosts(context, [
    {
      type: "discardHand",
      count: 1,
    },
  ]);

  expect(actor.board.hand).not.toContain(discarded);
  expect(actor.board.trash).toContain(discarded);

  expect(game.logs).toHaveLength(1);

  const log = game.logs[0];

  expect(log.type).toBe(LogType.Effect);
  expect(log.playerId).toBe(actor.id);

  expect(log.payload).toMatchObject({
    effectType: EffectLogType.DiscardHand,

    sourceInstanceId: source.instanceId,
    sourceCardId: source.card.id,
    sourceCardName: source.card.name,

    discardedInstanceId: discarded.instanceId,
    discardedCardId: discarded.card.id,
    discardedCardName: discarded.card.name,

    discardIndex: 1,
    discardCount: 1,
  });
});
});