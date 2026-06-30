import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { TestCardFactory } from "./helpers/TestCardFactory";
import { advanceToMainPhase } from "./helpers/gamePhaseHelper";

import { BoardLine } from "../gameEngine/enum/BoardLine";
import { Effect } from "../gameEngine/effects/Effect";
import { EffectTrigger } from "../gameEngine/effects/EffectTrigger";
import { PlayCardAction } from "../gameEngine/actions/PlayCardAction";

describe("EffectResolver", () => {
  it("登場時、自分の場に指定名称が両方ある場合、カードを1枚引く", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);

    player.board.setActionPoint(3);

    const temari = TestCardFactory.createCharacter({
      name: "月村 手毬",
      bp: 1500,
    });

    const kotone = TestCardFactory.createCharacter({
      name: "藤田 ことね",
      bp: 1000,
    });

    player.board.energyLine[0].setCard(temari);
    player.board.frontLine[0].setCard(kotone);

    const effects: Effect[] = [
      {
        trigger: EffectTrigger.OnPlay,
        conditions: [
          {
            type: "hasCharacterNamesOnField",
            names: ["月村 手毬", "藤田 ことね"],
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
    ];

    const saki = TestCardFactory.createCharacter({
      name: "花海 咲季",
      bp: 3000,
      effects,
    });

    player.board.hand.unshift(saki);

    const handBefore = player.board.hand.length;
    const deckBefore = player.board.deck.length;

    PlayCardAction.execute(game, 0, BoardLine.FrontLine);

    expect(player.board.hand.length).toBe(handBefore); 
    expect(player.board.deck.length).toBe(deckBefore - 1);
    expect(player.board.frontLine[1].getCard()?.card.name).toBe("花海 咲季");
  });

  it("登場時、指定名称が揃っていない場合はドローしない", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);

    player.board.setActionPoint(3);

    const temari = TestCardFactory.createCharacter({
      name: "月村 手毬",
      bp: 1500,
    });

    player.board.energyLine[0].setCard(temari);

    const effects: Effect[] = [
      {
        trigger: EffectTrigger.OnPlay,
        conditions: [
          {
            type: "hasCharacterNamesOnField",
            names: ["月村 手毬", "藤田 ことね"],
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
    ];

    const saki = TestCardFactory.createCharacter({
      name: "花海 咲季",
      bp: 3000,
      effects,
    });

    player.board.hand.unshift(saki);

    const handBefore = player.board.hand.length;
    const deckBefore = player.board.deck.length;

    PlayCardAction.execute(game, 0, BoardLine.FrontLine);

    expect(player.board.hand.length).toBe(handBefore - 1);
    expect(player.board.deck.length).toBe(deckBefore);
    expect(player.board.frontLine[0].getCard()?.card.name).toBe("花海 咲季");
  });
  it("登場時、エナジーラインに登場し、指定名称が両方ある場合、このキャラをアクティブにする", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);

    player.board.setActionPoint(3);

    const saki = TestCardFactory.createCharacter({
      name: "花海 咲季",
      bp: 3000,
    });

    const temari = TestCardFactory.createCharacter({
      name: "月村 手毬",
      bp: 1500,
    });

    player.board.frontLine[0].setCard(saki);
    player.board.frontLine[1].setCard(temari);

    const effects: Effect[] = [
      {
        trigger: EffectTrigger.OnPlay,
        conditions: [
          {
            type: "isOnLine",
            line: "energyLine",
          },
          {
            type: "hasCharacterNamesOnField",
            names: ["花海 咲季", "月村 手毬"],
            mode: "all",
          },
        ],
        actions: [
          {
            type: "activate",
            target: "self",
          },
        ],
      },
    ];

    const kotone = TestCardFactory.createCharacter({
      name: "藤田 ことね",
      bp: 3000,
      effects,
    });

    player.board.hand.unshift(kotone);

    PlayCardAction.execute(game, 0, BoardLine.EnergyLine);

    const playedCard = player.board.energyLine[0].getCard();

    expect(playedCard?.card.name).toBe("藤田 ことね");
    expect(playedCard?.isRest).toBe(false);
  });
  it("登場時、指定名称が揃っていない場合、エナジーラインにレストのまま登場する", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);

    player.board.setActionPoint(3);

    const saki = TestCardFactory.createCharacter({
      name: "花海 咲季",
      bp: 3000,
    });

    player.board.frontLine[0].setCard(saki);

    const effects: Effect[] = [
      {
        trigger: EffectTrigger.OnPlay,
        conditions: [
          {
            type: "isOnLine",
            line: "energyLine",
          },
          {
            type: "hasCharacterNamesOnField",
            names: ["花海 咲季", "月村 手毬"],
            mode: "all",
          },
        ],
        actions: [
          {
            type: "activate",
            target: "self",
          },
        ],
      },
    ];

    const kotone = TestCardFactory.createCharacter({
      name: "藤田 ことね",
      bp: 3000,
      effects,
    });

    player.board.hand.unshift(kotone);

    PlayCardAction.execute(game, 0, BoardLine.EnergyLine);

    const playedCard = player.board.energyLine[0].getCard();

    expect(playedCard?.card.name).toBe("藤田 ことね");
    expect(playedCard?.isRest).toBe(true);
  });
});