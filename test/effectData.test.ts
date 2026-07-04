import { describe, it, expect } from "vitest";

import { CardFactory } from "../gameEngine/cards/CardFactory";
import { CardType } from "../gameEngine/enum/CardType";
import { TriggerType } from "../gameEngine/enum/TriggerType";
import { EffectTrigger } from "../gameEngine/effects/EffectTrigger";
import { Effect } from "../gameEngine/effects/Effect";
describe("Effect data", () => {
    it("構造化されたEffectをCardFactoryで読み込める", () => {
        const effects: Effect[] = [
    {
        trigger: EffectTrigger.OnPlay,
        conditions: [
        {
            type: "hasCharacterNamesOnField",
            names: ["月村 手毬", "藤田 ことね"],
            mode: "all",
        },
        ],
        actions: [
        {
            type: "draw",
            count: 1,
        },
        ],
    },
    ];
    const rawCard = {
        id: "EX13BT-GIM-1-067",
        name: "花海 咲季",
        imagePath: "/card-images/UA34BT_CGD-1-041.png",
        cardType: "character",
        requiredEnergy: { red: 3 },
        actionPointCost: 1,
        bp: 3000,
        generatedEnergy: { red: 2 },
        triggerType: "none",
        effects,
    };

    const card = CardFactory.create(rawCard);

    expect(card.cardType).toBe(CardType.Character);
    expect(card.triggerType).toBe(TriggerType.None);

    expect(card.effects).toHaveLength(1);
    expect(card.effects[0].trigger).toBe(EffectTrigger.OnPlay);

    expect(card.effects[0].conditions).toHaveLength(1);
    expect(card.effects[0].conditions?.[0]).toEqual({
      type: "hasCharacterNamesOnField",
      names: ["月村 手毬", "藤田 ことね"],
      mode: "all",
    });

    expect(card.effects[0].actions).toHaveLength(1);
    expect(card.effects[0].actions[0]).toEqual({
      type: "draw",
      count: 1,
    });
  });

  it("effectsが省略されたカードは空配列になる", () => {
    const rawCard = {
      id: "TEST-NO-EFFECT",
      name: "効果なしカード",
      cardType: "character",
      requiredEnergy: {},
      actionPointCost: 1,
      bp: 2000,
      generatedEnergy: { red: 1 },
      triggerType: "none",
    };

    const card = CardFactory.create(rawCard);

    expect(card.effects).toEqual([]);
  });

  
});