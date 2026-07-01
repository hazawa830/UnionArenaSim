import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

import { CardFactory } from "../gameEngine/cards/CardFactory";

describe("CardFactory JSON load", () => {
  it("gameEngine/cards/data 配下の全カードJSONを読み込んでCardを生成できる", () => {
    const dataDir = path.resolve(__dirname, "../gameEngine/cards/data");

    const files = fs
      .readdirSync(dataDir)
      .filter((file) => file.endsWith(".json"));

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
  const filePath = path.join(dataDir, file);
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  try {
    const card = CardFactory.create(raw);

    expect(card.id).toBe(raw.id);
    expect(card.name).toBe(raw.name);
    expect(card.cardType).toBe(raw.cardType);
    expect(card.requiredEnergy).toBeDefined();
    expect(card.actionPointCost).toBe(raw.actionPointCost);
    expect(card.triggerType).toBeDefined();
    expect(card.effects).toBeDefined();
  } catch (e) {
    throw new Error(
      `Failed to load card "${raw.id}" (${raw.name}) in file "${file}":\n${e}`
    );
  }
}
  });
});