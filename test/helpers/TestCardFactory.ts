import { CardFactory } from "../../gameEngine/cards/CardFactory";
import { CardInstance } from "../../gameEngine/cards/CardInstance";
import { TriggerType } from "../../gameEngine/enum/TriggerType";
import { Effect } from "../../gameEngine/effects/Effect";
import { Keyword } from "../../gameEngine/cards/keywords/KeywordAbility";
let nextTestInstanceId = 900000;

type CreateTestCharacterOptions = {
  id?: string;
  name?: string;
  bp?: number;
  triggerType?: TriggerType;
  color?: string;
  effects?: Effect[];
  keywords?: Keyword[];
};

export class TestCardFactory {
  public static createCharacter(
    options: CreateTestCharacterOptions = {}
  ): CardInstance {
    const triggerType = options.triggerType ?? TriggerType.None;

    const card = CardFactory.create({
      id: options.id ?? `TEST-CHAR-${nextTestInstanceId}`,
      name: options.name ?? "テストキャラ",
      cardType: "character",
      requiredEnergy: {},
      actionPointCost: 1,
      bp: options.bp ?? 2000,
      generatedEnergy: { blue: 1 },
      triggerType,
      color: options.color,
      effects: options.effects ?? [],
      keywords: options.keywords ?? [],
    });

    return new CardInstance(nextTestInstanceId++, card);
  }

  public static createTriggerCard(
    triggerType: TriggerType,
    options: CreateTestCharacterOptions = {}
  ): CardInstance {
    return this.createCharacter({
      ...options,
      triggerType,
      color:
        options.color ??
        (triggerType === TriggerType.Color ? "blue" : undefined),
    });
  }

  public static createBlueTriggerCard(): CardInstance {
    return this.createTriggerCard(TriggerType.Color, {
      color: "blue",
      name: "青トリガーテスト",
    });
  }
}