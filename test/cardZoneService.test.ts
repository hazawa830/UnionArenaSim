import { describe, expect, it } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { createTestCharacterCard } from "./helpers/createTestCard";
import { CardInstance } from "../gameEngine/cards/CardInstance";
import { CardZone } from "../gameEngine/enum/CardZone";
import { CardZoneService } from "../gameEngine/service/CardZoneService";

describe("CardZoneService", () => {
  it("手札のカードを取得できる", () => {
    const game = createTestGame();
    const player = game.player1;

    expect(
      CardZoneService.getCards(player, CardZone.Hand)
    ).toEqual(player.board.hand);
  });

  it("山札のカードを取得できる", () => {
    const game = createTestGame();
    const player = game.player1;

    expect(
      CardZoneService.getCards(player, CardZone.Deck)
    ).toEqual(player.board.deck);
  });

  it("トラッシュのカードを取得できる", () => {
    const game = createTestGame();
    const player = game.player1;

    expect(
      CardZoneService.getCards(player, CardZone.Trash)
    ).toEqual(player.board.trash);
  });

  it("フロントラインのカードだけを取得できる", () => {
    const game = createTestGame();
    const player = game.player1;

    const card = new CardInstance(
      9001,
      createTestCharacterCard({
        name: "フロントのカード"
      })
    );

    player.board.frontLine[0].setCard(card);

    expect(
      CardZoneService.getCards(player, CardZone.FrontLine)
    ).toContain(card);
  });

  it("エナジーラインのカードだけを取得できる", () => {
    const game = createTestGame();
    const player = game.player1;

    const card = new CardInstance(
      9002,
      createTestCharacterCard({
        name: "エナジーのカード"
      })
    );

    player.board.energyLine[0].setCard(card);

    expect(
      CardZoneService.getCards(player, CardZone.EnergyLine)
    ).toContain(card);
  });
  it("フロントラインから指定カードを取り外せる", () => {
  const game = createTestGame();
  const player = game.player1;

  const target = player.board.hand[0];

  player.board.hand.shift();
  player.board.frontLine[0].setCard(target);

  const removed = CardZoneService.removeCard(
    player,
    CardZone.FrontLine,
    target
  );

  expect(removed).toBe(target);
  expect(player.board.frontLine[0].isEmpty()).toBe(true);
});
});