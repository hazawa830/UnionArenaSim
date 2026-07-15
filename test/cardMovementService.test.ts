import { describe, expect, it } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { createTestCharacterCard } from "./helpers/createTestCard";
import { CardInstance } from "../gameEngine/cards/CardInstance";
import { CardZone } from "../gameEngine/enum/CardZone";
import { CardZoneService } from "../gameEngine/service/CardZoneService";
import { CardMovementService } from "../gameEngine/service/CardMovementService";
import { DeckPosition } from "../gameEngine/enum/DeckPosition";

describe("cardMovementService", () => {
  it("山札上から手札へ移動できる", () => {
    const game = createTestGame();
    const player = game.player1;

    const target = player.board.deck[0];

    CardMovementService.moveCards(
        player,
        [target],
        CardZone.Deck,
        CardZone.Hand
    );

    expect(player.board.deck).not.toContain(target);
    expect(player.board.hand).toContain(target);
    });
    it("カードを山札下へ追加できる", () => {
        const game = createTestGame();
        const player = game.player1;

        const target = player.board.hand[0];

        CardMovementService.moveCards(
            player,
            [target],
            CardZone.Hand,
            CardZone.Deck,
            {
            deckPosition: DeckPosition.Bottom
            }
        );

        expect(player.board.hand).not.toContain(target);
        expect(player.board.deck.at(-1)).toBe(target);
        });
    it("移動元に存在しないカードが含まれる場合は何も移動しない", () => {
    const game = createTestGame();
    const player = game.player1;

    const existingCard = player.board.hand[0];
    const missingCard = player.board.deck[0];

    const handBefore = [...player.board.hand];
    const deckBefore = [...player.board.deck];

    expect(() => {
        CardMovementService.moveCards(
        player,
        [existingCard, missingCard],
        CardZone.Hand,
        CardZone.Deck,
        {
            deckPosition: DeckPosition.Bottom
        }
        );
    }).toThrow();

    expect(player.board.hand).toEqual(handBefore);
    expect(player.board.deck).toEqual(deckBefore);
    });
    it("山札上の複数カードを同じ順序で山札下へ移動できる", () => {
  const game = createTestGame();
  const player = game.player1;

  const first = player.board.deck[0];
  const second = player.board.deck[1];
  const third = player.board.deck[2];

  CardMovementService.moveCardsWithinDeck(
    player,
    [first, third],
    DeckPosition.Bottom
  );

  expect(player.board.deck.at(-2)).toBe(first);
  expect(player.board.deck.at(-1)).toBe(third);
  expect(player.board.deck[0]).toBe(second);
});
it("山札に存在しないカードを並べ替えようとした場合は変更しない", () => {
  const game = createTestGame();
  const player = game.player1;

  const handCard = player.board.hand[0];
  const deckBefore = [...player.board.deck];

  expect(() => {
    CardMovementService.moveCardsWithinDeck(
      player,
      [handCard],
      DeckPosition.Bottom
    );
  }).toThrow();

  expect(player.board.deck).toEqual(deckBefore);
});
it("フロントラインからトラッシュへ移動できる", () => {
  const game = createTestGame();
  const player = game.player1;

  const target = player.board.hand[0];

  player.board.hand.shift();
  player.board.frontLine[0].setCard(target);

  CardMovementService.moveCards(
    player,
    [target],
    CardZone.FrontLine,
    CardZone.Trash
  );

  expect(player.board.frontLine[0].isEmpty()).toBe(true);
  expect(player.board.trash).toContain(target);
});
it("エナジーラインからトラッシュへ移動できる", () => {
  const game = createTestGame();
  const player = game.player1;

  const target = player.board.hand[0];

  player.board.hand.shift();
  player.board.energyLine[0].setCard(target);

  CardMovementService.moveCards(
    player,
    [target],
    CardZone.EnergyLine,
    CardZone.Trash
  );

  expect(player.board.energyLine[0].isEmpty()).toBe(true);
  expect(player.board.trash).toContain(target);
});
it("トラッシュからリムーブエリアへ移動できる", () => {
  const game = createTestGame();
  const player = game.player1;

  const target = player.board.hand[0];

  CardMovementService.moveCards(
    player,
    [target],
    CardZone.Hand,
    CardZone.Trash
  );

  CardMovementService.moveCards(
    player,
    [target],
    CardZone.Trash,
    CardZone.Remove
  );

  expect(player.board.trash).not.toContain(target);
  expect(player.board.removeArea).toContain(target);
});
it("トラッシュからフロントラインへレストで移動できる", () => {
  const game = createTestGame();
  const player = game.player1;

  const target = player.board.hand[0];

  CardMovementService.moveCards(
    player,
    [target],
    CardZone.Hand,
    CardZone.Trash
  );

  CardMovementService.moveCards(
    player,
    [target],
    CardZone.Trash,
    CardZone.FrontLine,
    {
      enterRested: true
    }
  );

  expect(player.board.trash).not.toContain(target);
  expect(player.board.frontLine[0].getCard()).toBe(target);
  expect(target.isRest).toBe(true);
});
it("トラッシュからエナジーラインへレストで移動できる", () => {
  const game = createTestGame();
  const player = game.player1;

  const target = player.board.hand[0];

  CardMovementService.moveCards(
    player,
    [target],
    CardZone.Hand,
    CardZone.Trash
  );

  CardMovementService.moveCards(
    player,
    [target],
    CardZone.Trash,
    CardZone.EnergyLine,
    {
      enterRested: true
    }
  );

  expect(player.board.trash).not.toContain(target);
  expect(player.board.energyLine[0].getCard()).toBe(target);
  expect(target.isRest).toBe(true);
});
it("フロントラインに空きがない場合は移動元を変更しない", () => {
  const game = createTestGame();
  const player = game.player1;

  const target = player.board.hand[0];

  CardMovementService.moveCards(
    player,
    [target],
    CardZone.Hand,
    CardZone.Trash
  );

  for (let i = 0; i < player.board.frontLine.length; i++) {
    const fillCard = player.board.hand[0];

    if (!fillCard) {
      throw new Error("フロントラインを埋めるカードが不足しています");
    }

    CardMovementService.moveCards(
      player,
      [fillCard],
      CardZone.Hand,
      CardZone.FrontLine
    );
  }

  expect(() => {
    CardMovementService.moveCards(
      player,
      [target],
      CardZone.Trash,
      CardZone.FrontLine,
      {
        enterRested: true
      }
    );
  }).toThrow();

  expect(player.board.trash).toContain(target);
});
});