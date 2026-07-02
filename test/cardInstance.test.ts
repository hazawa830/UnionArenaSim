import { describe, it, expect } from "vitest";

import { TestCardFactory } from "./helpers/TestCardFactory";

describe("CardInstance", () => {
  it("raidBase がない場合はレイド状態ではない", () => {
    const card = TestCardFactory.createCharacter({
      name: "通常キャラ",
      bp: 3000,
    });

    expect(card.isRaid()).toBe(false);
  });

  it("raidBase がある場合はレイド状態として扱う", () => {
    const raidCard = TestCardFactory.createCharacter({
      name: "レイド後キャラ",
      bp: 4000,
    });

    const baseCard = TestCardFactory.createCharacter({
      name: "レイド元キャラ",
      bp: 1500,
    });

    raidCard.raidBase = baseCard;

    expect(raidCard.isRaid()).toBe(true);
    expect(raidCard.raidBase).toBe(baseCard);
  });
});