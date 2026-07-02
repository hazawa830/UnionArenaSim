import { describe, expect, it } from "vitest";

import { RaidConditionResolver } from "../../gameEngine/raid/RaidConditionResolver";
import { TestCardFactory } from "../helpers/TestCardFactory";

describe("RaidConditionResolver", () => {
  it("カード名が一致する場合はレイド可能", () => {
    const base = TestCardFactory.createCharacter({
      name: "月村 手毬",
      bp: 1500,
    });

    const result = RaidConditionResolver.canRaidOn(
      [
        {
          type: "cardName",
          names: ["月村 手毬"],
        },
      ],
      base
    );

    expect(result).toBe(true);
  });

  it("カード名が一致しない場合はレイド不可", () => {
    const base = TestCardFactory.createCharacter({
      name: "花海 咲季",
      bp: 1500,
    });

    const result = RaidConditionResolver.canRaidOn(
      [
        {
          type: "cardName",
          names: ["月村 手毬"],
        },
      ],
      base
    );

    expect(result).toBe(false);
  });

  it("複数候補のいずれかに一致すればレイド可能", () => {
    const base = TestCardFactory.createCharacter({
      name: "藤田 ことね",
      bp: 1500,
    });

    const result = RaidConditionResolver.canRaidOn(
      [
        {
          type: "cardName",
          names: ["花海 咲季", "藤田 ことね"],
        },
      ],
      base
    );

    expect(result).toBe(true);
  });

  it("raidConditionsが空ならレイド不可", () => {
    const base = TestCardFactory.createCharacter({
      name: "月村 手毬",
      bp: 1500,
    });

    const result = RaidConditionResolver.canRaidOn([], base);

    expect(result).toBe(false);
  });

  it("未知の条件タイプは例外を送出する", () => {
    const base = TestCardFactory.createCharacter({
      name: "月村 手毬",
      bp: 1500,
    });

    expect(() =>
      RaidConditionResolver.canRaidOn(
        [
          {
            type: "unknown",
          } as any,
        ],
        base
      )
    ).toThrow("Unknown raid condition");
  });
});