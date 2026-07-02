import { CardInstance } from "../cards/CardInstance";
import { Keyword } from "../cards/keywords/KeywordAbility";

export class KeywordResolver {
  public static getCurrentKeywords(card: CardInstance): Keyword[] {
    return [
      ...card.card.keywords,
      ...(card.isRaid() ? card.card.raidKeywords : []),
    ];
  }

  public static hasKeyword(
    card: CardInstance,
    type: Keyword["type"]
  ): boolean {
    return this.getCurrentKeywords(card).some(
      (keyword) => keyword.type === type
    );
  }

  public static getImpactDamage(card: CardInstance): number {
    const keywords = this.getCurrentKeywords(card);

    const impactValues = keywords
      .filter((keyword) => keyword.type === "impact")
      .map((keyword) => keyword.value);

    const baseImpact =
      impactValues.length > 0 ? Math.max(...impactValues) : 0;

    const impactPlus = keywords
      .filter((keyword) => keyword.type === "impactPlus")
      .reduce((sum, keyword) => sum + keyword.value, 0);

    if (baseImpact === 0 && impactPlus === 0) {
      return 0;
    }

    return Math.max(1, baseImpact) + impactPlus;
  }

  public static getDirectDamage(card: CardInstance): number {
    const keywords = this.getCurrentKeywords(card);

    const damageValues = keywords
      .filter((keyword) => keyword.type === "damage")
      .map((keyword) => keyword.value);

    const baseDamage =
      damageValues.length > 0 ? Math.max(...damageValues) : 1;

    const damagePlus = keywords
      .filter((keyword) => keyword.type === "damagePlus")
      .reduce((sum, keyword) => sum + keyword.value, 0);

    return baseDamage + damagePlus;
  }

  public static getImpactDamageForBattle(
    attacker: CardInstance,
    blocker: CardInstance
  ): number {
    if (this.hasKeyword(blocker, "impactNullify")) {
      return 0;
    }

    return this.getImpactDamage(attacker);
  }
}