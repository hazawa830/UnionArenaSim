import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { TestCardFactory } from "./helpers/TestCardFactory";
import { advanceToMainPhase } from "./helpers/gamePhaseHelper";

import { BoardLine } from "../gameEngine/enum/BoardLine";
import { Effect } from "../gameEngine/effects/Effect";
import { EffectTrigger } from "../gameEngine/effects/EffectTrigger";
import { PlayCardAction } from "../gameEngine/actions/PlayCardAction";

describe("SearchTopDeckEffectAction", () => {
  it("登場時、山札上3枚から指定名称のキャラを1枚手札に加え、残りを山札下に置き、加えた場合は手札を1枚捨てる", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);
    player.board.setActionPoint(3);

    const effects: Effect[] = [
      {
        trigger: EffectTrigger.OnPlay,
        actions: [
          {
            type: "searchTopDeck",
            lookCount: 3,
            takeCount: 1,
            target: {
              cardType: "character",
              nameFilter: ["月村 手毬", "花海 咲季", "藤田 ことね"],
            },
            restToBottom: true,
            ifTaken: [
              {
                type: "discardHand",
                count: 1,
              },
            ],
          },
        ],
      },
    ];

    const kotone = TestCardFactory.createCharacter({
      name: "藤田 ことね",
      bp: 3000,
      effects,
    });

    const hitCard = TestCardFactory.createCharacter({
      name: "月村 手毬",
      bp: 1500,
    });

    const missCard1 = TestCardFactory.createCharacter({
      name: "別キャラA",
      bp: 1000,
    });

    const missCard2 = TestCardFactory.createCharacter({
      name: "別キャラB",
      bp: 1000,
    });

    const discardCard = TestCardFactory.createCharacter({
      name: "捨てる手札",
      bp: 1000,
    });

    player.board.hand.splice(0, player.board.hand.length);
    player.board.hand.push(kotone);
    player.board.hand.push(discardCard);

    player.board.deck.unshift(missCard1, hitCard, missCard2);

    const deckBefore = player.board.deck.length;

    PlayCardAction.execute(game, 0, BoardLine.FrontLine);

    expect(player.board.frontLine[0].getCard()).toBe(kotone);

    expect(player.board.hand).toContain(hitCard);
    expect(player.board.trash).toContain(discardCard);

    expect(player.board.deck.length).toBe(deckBefore - 3 + 2);
    expect(player.board.deck[player.board.deck.length - 2]).toBe(missCard1);
    expect(player.board.deck[player.board.deck.length - 1]).toBe(missCard2);
  });

  it("指定名称のカードがない場合、手札に加えず、手札も捨てない", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    advanceToMainPhase(game);
    player.board.setActionPoint(3);

    const effects: Effect[] = [
      {
        trigger: EffectTrigger.OnPlay,
        actions: [
          {
            type: "searchTopDeck",
            lookCount: 3,
            takeCount: 1,
            target: {
              cardType: "character",
              nameFilter: ["月村 手毬", "花海 咲季", "藤田 ことね"],
            },
            restToBottom: true,
            ifTaken: [
              {
                type: "discardHand",
                count: 1,
              },
            ],
          },
        ],
      },
    ];

    const kotone = TestCardFactory.createCharacter({
      name: "藤田 ことね",
      bp: 3000,
      effects,
    });

    const missCard1 = TestCardFactory.createCharacter({
      name: "別キャラA",
      bp: 1000,
    });

    const missCard2 = TestCardFactory.createCharacter({
      name: "別キャラB",
      bp: 1000,
    });

    const missCard3 = TestCardFactory.createCharacter({
      name: "別キャラC",
      bp: 1000,
    });

    const keepHandCard = TestCardFactory.createCharacter({
      name: "捨てられない手札",
      bp: 1000,
    });

    player.board.hand.splice(0, player.board.hand.length);
    player.board.hand.push(kotone);
    player.board.hand.push(keepHandCard);

    player.board.deck.unshift(missCard1, missCard2, missCard3);

    const handBefore = player.board.hand.length;
    const trashBefore = player.board.trash.length;

    PlayCardAction.execute(game, 0, BoardLine.FrontLine);

    expect(player.board.hand.length).toBe(handBefore - 1);
    expect(player.board.hand).toContain(keepHandCard);
    expect(player.board.trash.length).toBe(trashBefore);

    expect(player.board.deck[player.board.deck.length - 3]).toBe(missCard1);
    expect(player.board.deck[player.board.deck.length - 2]).toBe(missCard2);
    expect(player.board.deck[player.board.deck.length - 1]).toBe(missCard3);
  });
});