import { describe, expect, it } from "vitest";

import { createTestGame } from "../helpers/createTestGame";
import { TestCardFactory } from "../helpers/TestCardFactory";

import { DrawEffectAction } from "../../gameEngine/effects/actions/DrawEffectAction";
import { EffectContext } from "../../gameEngine/effects/EffectContext";
import { LogType } from "../../gameEngine/enum/LogType";
import { EffectLogType } from "../../gameEngine/enum/EffectLogType"; 

describe("DrawEffectAction", () => {
  it("カードを指定枚数ドローし、Effectログを追加する", () => {
    const game = createTestGame();

    const actor = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    const source = TestCardFactory.createCharacter({
      name: "ドロー効果元",
      bp: 3000,
    });

    const context: EffectContext = {
      game,
      source,
      actor,
      opponent,
    };

    const handBefore = actor.board.hand.length;
    const deckBefore = actor.board.deck.length;

    DrawEffectAction.execute(context, {
      type: "draw",
      count: 2,
    });

    expect(actor.board.hand.length).toBe(handBefore + 2);
    expect(actor.board.deck.length).toBe(deckBefore - 2);

    expect(game.logs).toHaveLength(1);

    const log = game.logs[0];

    expect(log.type).toBe(LogType.Effect);
    expect(log.playerId).toBe(actor.id);
    expect(log.message).toContain("2枚ドロー");

    expect(log.payload).toMatchObject({
      effectType: EffectLogType.Draw,
      sourceInstanceId: source.instanceId,
      sourceCardId: source.card.id,
      sourceCardName: source.card.name,
      drawCount: 2,
    });
  });
});