import { CharacterCard } from "../../gameEngine/cards/CharacterCard";
import { Energy } from "../../gameEngine/models/Energy";
import { CardType } from "../../gameEngine/enum/CardType";
import { TriggerType } from "../../gameEngine/enum/TriggerType";

type CreateTestCardOptions = {
  id?: string;
  name?: string;
  bp?: number;
  triggerType?: TriggerType;
  color?: string;
  features?: string[];
};

export function createTestCharacterCard(options: CreateTestCardOptions = {}) {
  return new CharacterCard({
    id: options.id ?? "TEST-CHARACTER",
    name: options.name ?? "テストキャラ",
    imagePath: undefined,
    cardType: CardType.Character,
    requiredEnergy: new Energy({}),
    actionPointCost: 1,
    bp: options.bp ?? 2000,
    generatedEnergy: new Energy({ blue: 1 }),
    triggerType: options.triggerType ?? TriggerType.None,
    color: options.color,
    effects: [],
    features: options.features ?? [],
  });
}