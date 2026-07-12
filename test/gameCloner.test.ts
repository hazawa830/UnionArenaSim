import { describe, expect, it } from "vitest";

import { GameFactory } from "../gameEngine/factory/GameFactory";
import { GameCloner } from "../gameEngine/core/GameCloner";

describe("GameCloner", () => {
  it("clone側でカードを移動しても元gameの手札とトラッシュは変わらない", () => {
    const game = GameFactory.createSampleGame();

    const originalPlayer = game.player1;
    const originalHandCount = originalPlayer.board.hand.length;
    const originalTrashCount = originalPlayer.board.trash.length;
    const originalFirstHandCard = originalPlayer.board.hand[0];

    const clonedGame = GameCloner.clone(game);
    const clonedPlayer = clonedGame.player1;

    const movedCard = clonedPlayer.board.hand.shift();

    if (!movedCard) {
      throw new Error("clone側の手札が空です");
    }

    clonedPlayer.board.trash.push(movedCard);

    expect(originalPlayer.board.hand.length).toBe(originalHandCount);
    expect(originalPlayer.board.trash.length).toBe(originalTrashCount);
    expect(originalPlayer.board.hand[0]).toBe(originalFirstHandCard);

    expect(clonedPlayer.board.hand.length).toBe(originalHandCount - 1);
    expect(clonedPlayer.board.trash).toContain(movedCard);
  });

  it("cloneされたCardInstanceは元のCardInstanceとは別参照になる", () => {
    const game = GameFactory.createSampleGame();

    const originalCard = game.player1.board.hand[0];

    const clonedGame = GameCloner.clone(game);
    const clonedCard = clonedGame.player1.board.hand[0];

    expect(clonedCard).not.toBe(originalCard);
    expect(clonedCard.instanceId).toBe(originalCard.instanceId);
    expect(clonedCard.card).toBe(originalCard.card);
  });

  it("clone側でカードをRestにしても元カードはRestにならない", () => {
    const game = GameFactory.createSampleGame();

    const originalCard = game.player1.board.hand[0];

    const clonedGame = GameCloner.clone(game);
    const clonedCard = clonedGame.player1.board.hand[0];

    clonedCard.isRest = true;

    expect(originalCard.isRest).toBe(false);
    expect(clonedCard.isRest).toBe(true);
  });

  it("clone側のフロントにカードを置いても元gameのフロントは変わらない", () => {
    const game = GameFactory.createSampleGame();

    const originalPlayer = game.player1;
    const originalFrontCard = originalPlayer.board.frontLine[0].getCard();

    const clonedGame = GameCloner.clone(game);
    const clonedPlayer = clonedGame.player1;

    const card = clonedPlayer.board.hand.shift();

    if (!card) {
      throw new Error("clone側の手札が空です");
    }

    clonedPlayer.board.frontLine[0].setCard(card);

    expect(originalPlayer.board.frontLine[0].getCard()).toBe(originalFrontCard);
    expect(clonedPlayer.board.frontLine[0].getCard()).toBe(card);
  });
});