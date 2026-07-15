import { describe, expect, it } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { TestCardFactory } from "./helpers/TestCardFactory";

import { DiscardHandEffectAction } from "../gameEngine/effects/actions/DiscardHandEffectAction";
import { DestroyEffectAction } from "../gameEngine/effects/actions/DestroyEffectAction";
import { SearchTopDeckEffectAction } from "../gameEngine/effects/actions/SearchTopDeckEffectAction";

describe("Zone movement regression", () => {
  it("discardHandで手札先頭のカードがトラッシュへ移動する", () => {
    const game = createTestGame();
    const actor = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    const source = TestCardFactory.createCharacter({
      name: "手札破棄効果元",
      bp: 2000,
    });

    const discardTarget = TestCardFactory.createCharacter({
      name: "破棄対象",
      bp: 1000,
    });

    const keepCard = TestCardFactory.createCharacter({
      name: "残る手札",
      bp: 1000,
    });

    actor.board.hand.splice(
      0,
      actor.board.hand.length,
      discardTarget,
      keepCard
    );

    const handBefore = actor.board.hand.length;
    const trashBefore = actor.board.trash.length;

    DiscardHandEffectAction.execute(
      {
        game,
        actor,
        opponent,
        source,
      },
      {
        type: "discardHand",
        count: 1,
      }
    );

    expect(actor.board.hand).not.toContain(discardTarget);
    expect(actor.board.hand).toContain(keepCard);
    expect(actor.board.trash).toContain(discardTarget);

    expect(actor.board.hand.length).toBe(handBefore - 1);
    expect(actor.board.trash.length).toBe(trashBefore + 1);
  });

  it("destroyでフロントラインのカードがトラッシュへ移動する", () => {
    const game = createTestGame();
    const actor = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    const source = TestCardFactory.createCharacter({
      name: "退場効果元",
      bp: 3000,
    });

    const destroyTarget = TestCardFactory.createCharacter({
      name: "退場対象",
      bp: 2000,
    });

    opponent.board.frontLine[0].setCard(destroyTarget);

    const trashBefore = opponent.board.trash.length;

    DestroyEffectAction.execute(
      {
        game,
        actor,
        opponent,
        source,
      },
      {
        type: "destroy",
        target: {
          side: "opponent",
          zone: "frontLine",
          cardType: "character",
          maxCount: 1,
        },
      }
    );

    expect(opponent.board.frontLine[0].isEmpty()).toBe(true);
    expect(opponent.board.trash).toContain(destroyTarget);
    expect(opponent.board.trash.length).toBe(trashBefore + 1);
  });

  it("searchTopDeckで山札上の対象カードが手札へ移動する", () => {
    const game = createTestGame();
    const actor = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    const source = TestCardFactory.createCharacter({
      name: "山札検索効果元",
      bp: 2000,
    });

    const missCard1 = TestCardFactory.createCharacter({
      name: "対象外A",
      bp: 1000,
    });

    const hitCard = TestCardFactory.createCharacter({
      name: "検索対象",
      bp: 1000,
    });

    const missCard2 = TestCardFactory.createCharacter({
      name: "対象外B",
      bp: 1000,
    });

    actor.board.deck.unshift(missCard1, hitCard, missCard2);

    const handBefore = actor.board.hand.length;
    const deckBefore = actor.board.deck.length;

    SearchTopDeckEffectAction.execute(
      {
        game,
        actor,
        opponent,
        source,
      },
      {
        type: "searchTopDeck",
        lookCount: 3,
        takeCount: 1,
        target: {
          cardType: "character",
          nameFilter: ["検索対象"],
        },
        restToBottom: true,
      }
    );

    expect(actor.board.hand).toContain(hitCard);
    expect(actor.board.deck).not.toContain(hitCard);

    expect(actor.board.hand.length).toBe(handBefore + 1);

    // 山札上3枚を見て、1枚を手札へ、残り2枚を山札へ戻す
    expect(actor.board.deck.length).toBe(deckBefore - 1);
  });

  it("searchTopDeckで選ばれなかったカードが元の順序で山札下へ移動する", () => {
    const game = createTestGame();
    const actor = game.getCurrentPlayer();
    const opponent = game.getOpponentPlayer();

    const source = TestCardFactory.createCharacter({
      name: "山札検索効果元",
      bp: 2000,
    });

    const missCard1 = TestCardFactory.createCharacter({
      name: "対象外A",
      bp: 1000,
    });

    const hitCard = TestCardFactory.createCharacter({
      name: "検索対象",
      bp: 1000,
    });

    const missCard2 = TestCardFactory.createCharacter({
      name: "対象外B",
      bp: 1000,
    });

    actor.board.deck.unshift(missCard1, hitCard, missCard2);

    SearchTopDeckEffectAction.execute(
      {
        game,
        actor,
        opponent,
        source,
      },
      {
        type: "searchTopDeck",
        lookCount: 3,
        takeCount: 1,
        target: {
          cardType: "character",
          nameFilter: ["検索対象"],
        },
        restToBottom: true,
      }
    );

    const deckLength = actor.board.deck.length;

    expect(actor.board.deck[deckLength - 2]).toBe(missCard1);
    expect(actor.board.deck[deckLength - 1]).toBe(missCard2);

    expect(actor.board.deck).not.toContain(hitCard);
  });
});