import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { createTestCharacterCard } from "./helpers/createTestCard";
import { CardInstance } from "../gameEngine/cards/CardInstance";
import { SearchTopDeckEffectAction } from "../gameEngine/effects/actions/SearchTopDeckEffectAction";

describe("Feature", () => {
  it("カードが複数の特徴を保持できる", () => {
    const card = createTestCharacterCard({
      name: "テストカード",
      features: ["ワルキューレ", "歌（ワルキューレ）"]
    });

    expect(card.features).toEqual([
      "ワルキューレ",
      "歌（ワルキューレ）"
    ]);
  });

  it("山札上から指定特徴を持つカードだけを検索対象にする", () => {
    const game = createTestGame();

    const walkureCard = createTestCharacterCard({
      id: "TEST-WALKURE",
      name: "ワルキューレカード",
      features: ["ワルキューレ"]
    });

    const otherCard1 = createTestCharacterCard({
      id: "TEST-OTHER-1",
      name: "対象外カード1",
      features: ["パイロット"]
    });

    const otherCard2 = createTestCharacterCard({
      id: "TEST-OTHER-2",
      name: "対象外カード2",
      features: ["パイロット"]
    });

    const walkure = new CardInstance(1001, walkureCard);
    const other1 = new CardInstance(1002, otherCard1);
    const other2 = new CardInstance(1003, otherCard2);

    game.player1.board.deck = [
      other1,
      walkure,
      other2,
      ...game.player1.board.deck
    ];

    const source =
      game.player1.board.hand[0] ??
      new CardInstance(
        1004,
        createTestCharacterCard({
          id: "TEST-SOURCE",
          name: "効果発生元"
        })
      );

    SearchTopDeckEffectAction.execute(
      {
        game,
        actor: game.player1,
        opponent: game.player2,
        source
      },
      {
        type: "searchTopDeck",
        lookCount: 3,
        takeCount: 1,
        target: {
          features: ["ワルキューレ"]
        },
        restToBottom: true
      }
    );

    expect(game.player1.board.hand).toContain(walkure);
    expect(game.player1.board.hand).not.toContain(other1);
    expect(game.player1.board.hand).not.toContain(other2);
  });
});