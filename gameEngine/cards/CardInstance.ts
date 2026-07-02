import { Card } from "./Card";
import { CharacterCard } from "./CharacterCard";

export class CardInstance {
  public usedEffectIdsThisTurn = new Set<string>();
  public cannotBeBlockedByMinBp?: number;

  public attackedThisTurnCount: number = 0;
  public blockedThisTurnCount: number = 0;

  /** レイド登場している場合のレイド元カード */
  public raidBase?: CardInstance;

  constructor(
    public readonly instanceId: number,
    public readonly card: Card,
    public isRest: boolean = false,
    public temporaryBpBonus: number = 0
  ) {}

  public isRaid(): boolean {
    return this.raidBase !== undefined;
  }

  public getCurrentBp(): number {
    if (!(this.card instanceof CharacterCard)) {
      throw new Error("Only character cards have BP.");
    }

    return this.card.bp + this.temporaryBpBonus;
  }
}