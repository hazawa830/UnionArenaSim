import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { TestCardFactory } from "./helpers/TestCardFactory";
import { advanceToMainPhase } from "./helpers/gamePhaseHelper";

import { BoardLine } from "../gameEngine/enum/BoardLine";
import { Effect } from "../gameEngine/effects/Effect";
import { EffectTrigger } from "../gameEngine/effects/EffectTrigger";
import { ActivateMainEffectAction } from "../gameEngine/actions/ActivateMainEffectAction";

describe("EffectResolver integration", () => {
  it("ActivateMainでoncePerTurn・cost・actionをまとめて解決できる", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);

    const effect: Effect = {
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
    };

    const source = TestCardFactory.createCharacter({
      name: "月村 手毬",
      bp: 1500,
      effects: [effect],
    });

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
    player.board.frontLine[0].setCard(source);

    ActivateMainEffectAction.execute(game, BoardLine.FrontLine, 0);
    ActivateMainEffectAction.execute(game, BoardLine.FrontLine, 0);

    expect(source.temporaryBpBonus).toBe(1500);

    expect(player.board.trash).toContain(discardCard1);
    expect(player.board.trash).not.toContain(discardCard2);

    expect(player.board.hand).toContain(discardCard2);
  });
});