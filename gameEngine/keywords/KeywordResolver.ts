import { CardInstance } from "../cards/CardInstance";

export class KeywordResolver {
  public static getImpactDamage(card: CardInstance): number {
    const impactValues = card.card.keywords
      .filter((keyword) => keyword.type === "impact")
      .map((keyword) => keyword.value);

    const baseImpact =
      impactValues.length > 0 ? Math.max(...impactValues) : 0;

    const impactPlus = card.card.keywords
      .filter((keyword) => keyword.type === "impactPlus")
      .reduce((sum, keyword) => sum + keyword.value, 0);

    if (baseImpact === 0 && impactPlus === 0) {
      return 0;
    }

    return Math.max(1, baseImpact) + impactPlus;
  }
  public static getDirectDamage(card: CardInstance): number {
    const damageValues = card.card.keywords
      .filter((keyword) => keyword.type === "damage")
      .map((keyword) => keyword.value);

    const baseDamage =
      damageValues.length > 0 ? Math.max(...damageValues) : 1;

    const damagePlus = card.card.keywords
      .filter((keyword) => keyword.type === "damagePlus")
      .reduce((sum, keyword) => sum + keyword.value, 0);

    return baseDamage + damagePlus;
  }
  public static getImpactDamageForBattle(
    attacker: CardInstance,
    blocker: CardInstance
  ): number {
    if (blocker.card.hasKeyword("impactNullify")) {
      return 0;
    }

    return this.getImpactDamage(attacker);
  }
}