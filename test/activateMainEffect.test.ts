import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { TestCardFactory } from "./helpers/TestCardFactory";
import { advanceToMainPhase } from "./helpers/gamePhaseHelper";

import { BoardLine } from "../gameEngine/enum/BoardLine";
import { Effect } from "../gameEngine/effects/Effect";
import { EffectTrigger } from "../gameEngine/effects/EffectTrigger";
import { ActivateMainEffectAction } from "../gameEngine/actions/ActivateMainEffectAction";

describe("ActivateMainEffectAction", () => {
  it("起動メインで自身をレストし、自分の他のキャラ1枚にBP+1000できる", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);

    const effects: Effect[] = [
      {
        trigger: EffectTrigger.ActivateMain,
        costs: [
          {
            type: "restSelf",
          },
        ],
        actions: [
          {
            type: "modifyBpThisTurn",
            target: "selectedOwnOtherCharacter",
            amount: 1000,
          },
        ],
      },
    ];

    const kotone = TestCardFactory.createCharacter({
      name: "藤田 ことね",
      bp: 3000,
      effects,
    });

    const saki = TestCardFactory.createCharacter({
      name: "花海 咲季",
      bp: 3000,
    });

    kotone.isRest = false;
    saki.isRest = false;

    player.board.frontLine[0].setCard(kotone);
    player.board.frontLine[1].setCard(saki);

    expect(kotone.isRest).toBe(false);
    expect(saki.temporaryBpBonus).toBe(0);

    ActivateMainEffectAction.execute(
      game,
      BoardLine.FrontLine,
      0,
      BoardLine.FrontLine,
      1
    );

    expect(kotone.isRest).toBe(true);
    expect(saki.temporaryBpBonus).toBe(1000);
  });

  it("Mainフェーズ以外では起動メインを使えない", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    const effects: Effect[] = [
      {
        trigger: EffectTrigger.ActivateMain,
        costs: [{ type: "restSelf" }],
        actions: [
          {
            type: "modifyBpThisTurn",
            target: "selectedOwnOtherCharacter",
            amount: 1000,
          },
        ],
      },
    ];

    const kotone = TestCardFactory.createCharacter({
      name: "藤田 ことね",
      bp: 3000,
      effects,
    });

    const saki = TestCardFactory.createCharacter({
      name: "花海 咲季",
      bp: 3000,
    });

    player.board.frontLine[0].setCard(kotone);
    player.board.frontLine[1].setCard(saki);

    expect(() => {
      ActivateMainEffectAction.execute(
        game,
        BoardLine.FrontLine,
        0,
        BoardLine.FrontLine,
        1
      );
    }).toThrow("Activate main effect is only allowed in main phase.");
  });

  it("レスト済みのキャラはrestSelfコストを支払えない", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);

    const effects: Effect[] = [
      {
        trigger: EffectTrigger.ActivateMain,
        costs: [{ type: "restSelf" }],
        actions: [
          {
            type: "modifyBpThisTurn",
            target: "selectedOwnOtherCharacter",
            amount: 1000,
          },
        ],
      },
    ];

    const kotone = TestCardFactory.createCharacter({
      name: "藤田 ことね",
      bp: 3000,
      effects,
    });

    const saki = TestCardFactory.createCharacter({
      name: "花海 咲季",
      bp: 3000,
    });

    kotone.isRest = true;

    player.board.frontLine[0].setCard(kotone);
    player.board.frontLine[1].setCard(saki);

    expect(() => {
      ActivateMainEffectAction.execute(
        game,
        BoardLine.FrontLine,
        0,
        BoardLine.FrontLine,
        1
      );
    }).toThrow("Rested card cannot pay restSelf cost.");

    expect(saki.temporaryBpBonus).toBe(0);
  });

  it("自分自身を対象にはできない", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);

    const effects: Effect[] = [
      {
        trigger: EffectTrigger.ActivateMain,
        costs: [{ type: "restSelf" }],
        actions: [
          {
            type: "modifyBpThisTurn",
            target: "selectedOwnOtherCharacter",
            amount: 1000,
          },
        ],
      },
    ];

    const kotone = TestCardFactory.createCharacter({
      name: "藤田 ことね",
      bp: 3000,
      effects,
    });

    kotone.isRest = false;

    player.board.frontLine[0].setCard(kotone);

    expect(() => {
      ActivateMainEffectAction.execute(
        game,
        BoardLine.FrontLine,
        0,
        BoardLine.FrontLine,
        0
      );
    }).toThrow("Cannot target self.");
  });
});