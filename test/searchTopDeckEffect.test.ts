import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { TestCardFactory } from "./helpers/TestCardFactory";
import { advanceToMainPhase } from "./helpers/gamePhaseHelper";

import { BoardLine } from "../gameEngine/enum/BoardLine";
import { Effect } from "../gameEngine/effects/Effect";
import { EffectTrigger } from "../gameEngine/effects/EffectTrigger";
import { PlayCardAction } from "../gameEngine/actions/PlayCardAction";
import { EffectAction, LookTopDeckAction } from "../gameEngine/effects/EffectAction";
import { LookTopDeckEffectAction } from "../gameEngine/effects/actions/LookTopDeckEffectAction";
import { CardZone } from "../gameEngine/enum/CardZone";
import { DeckPosition } from "../gameEngine/enum/DeckPosition";
import { CompleteLookTopDeckAction } from "../gameEngine/actions/CompleteLookTopDeckAction";
describe("SearchTopDeckEffectAction", () => {
  it("登場時、山札上3枚から指定名称のキャラを1枚手札に加え、残りを山札下に置く。discardHandは自動実行しない", () => {
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
    expect(player.board.hand).toContain(discardCard);
    expect(player.board.trash).not.toContain(discardCard);

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
  it("山札上から特徴に一致するカードだけを候補にする", () => {
  const game = createTestGame();
  const actor = game.player1;
  const opponent = game.player2;

  const source = actor.board.hand[0];

  const walkure = TestCardFactory.createCharacter({
    name: "ワルキューレ",
    features: ["ワルキューレ"]
  });

  const other1 = TestCardFactory.createCharacter({
    name: "対象外1",
    features: ["パイロット"]
  });

  const other2 = TestCardFactory.createCharacter({
    name: "対象外2",
    features: []
  });

  actor.board.deck.splice(0, 3, other1, walkure, other2);

  const action: LookTopDeckAction = {
    type: "lookTopDeck",
    lookCount: 3,
    selections: [
      {
        id: "take-walkure",
        minCount: 0,
        maxCount: 1,
        filter: {
          features: ["ワルキューレ"]
        },
        destination: CardZone.Hand
      }
    ],
    restDestination: CardZone.Deck,
    restDeckPosition: DeckPosition.Bottom
  };

  const result = LookTopDeckEffectAction.createResult(
    {
      game,
      actor,
      opponent,
      source
    },
    action
  );

  expect(result.revealedCards).toEqual([
    other1,
    walkure,
    other2
  ]);

  expect(result.selections[0].candidateCards).toEqual([
    walkure
  ]);
});
it("選択カードを手札へ移動し残りを山札下へ置く", () => {
  const game = createTestGame();
  const player = game.player1;

  const first = player.board.deck[0];
  const selected = player.board.deck[1];
  const third = player.board.deck[2];

  const action: LookTopDeckAction = {
    type: "lookTopDeck",
    lookCount: 3,
    selections: [
      {
        id: "take-card",
        minCount: 0,
        maxCount: 1,
        destination: CardZone.Hand
      }
    ],
    restDestination: CardZone.Deck,
    restDeckPosition: DeckPosition.Bottom
  };

  const result = CompleteLookTopDeckAction.execute(
    game,
    player.id,
    action,
    [first, selected, third],
    [
      {
        selectionId: "take-card",
        selectedCards: [selected]
      }
    ],
    [third, first]
  );

  expect(player.board.hand).toContain(selected);
  expect(player.board.deck).not.toContain(selected);

  expect(player.board.deck.at(-2)).toBe(third);
  expect(player.board.deck.at(-1)).toBe(first);

  expect(result.selectedCount).toBe(1);
});
it("0枚選択した場合はifSelectedを返さない", () => {
  const game = createTestGame();
  const player = game.player1;

  const first = player.board.deck[0];
  const second = player.board.deck[1];
  const third = player.board.deck[2];

  const action: LookTopDeckAction = {
    type: "lookTopDeck",
    lookCount: 3,
    selections: [
      {
        id: "take-card",
        minCount: 0,
        maxCount: 1,
        destination: CardZone.Hand
      }
    ],
    restDestination: CardZone.Deck,
    restDeckPosition: DeckPosition.Bottom,
    ifSelected: [
      {
        type: "discardHand",
        count: 1
      }
    ]
  };

  const result = CompleteLookTopDeckAction.execute(
    game,
    player.id,
    action,
    [first, second, third],
    [
      {
        selectionId: "take-card",
        selectedCards: []
      }
    ],
    [first, second, third]
  );

  expect(result.selectedCount).toBe(0);
  expect(result.followUpActions).toEqual([]);
});
it("カードを選択した場合はifSelectedを返す", () => {
  const game = createTestGame();
  const player = game.player1;

  const first = player.board.deck[0];
  const second = player.board.deck[1];
  const third = player.board.deck[2];

  const discardAction: EffectAction = {
    type: "discardHand",
    count: 1
  };

  const action: LookTopDeckAction = {
    type: "lookTopDeck",
    lookCount: 3,
    selections: [
      {
        id: "take-card",
        minCount: 0,
        maxCount: 1,
        destination: CardZone.Hand
      }
    ],
    restDestination: CardZone.Deck,
    restDeckPosition: DeckPosition.Bottom,
    ifSelected: [discardAction]
  };

  const result = CompleteLookTopDeckAction.execute(
    game,
    player.id,
    action,
    [first, second, third],
    [
      {
        selectionId: "take-card",
        selectedCards: [second]
      }
    ],
    [first, third]
  );

  expect(result.followUpActions).toEqual([discardAction]);
});
it("公開されていないカードを選択すると失敗する", () => {
  const game = createTestGame();
  const player = game.player1;

  const revealed = player.board.deck.slice(0, 3);
  const invalidCard = player.board.hand[0];

  const action: LookTopDeckAction = {
    type: "lookTopDeck",
    lookCount: 3,
    selections: [
      {
        id: "take-card",
        minCount: 0,
        maxCount: 1,
        destination: CardZone.Hand
      }
    ],
    restDestination: CardZone.Deck,
    restDeckPosition: DeckPosition.Bottom
  };

  expect(() => {
    CompleteLookTopDeckAction.execute(
      game,
      player.id,
      action,
      revealed,
      [
        {
          selectionId: "take-card",
          selectedCards: [invalidCard]
        }
      ]
    );
  }).toThrow();
});
});