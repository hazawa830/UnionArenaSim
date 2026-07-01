import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { TestCardFactory } from "./helpers/TestCardFactory";

import { EffectCostExecutor } from "../gameEngine/effects/EffectCostExecutor";

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
});