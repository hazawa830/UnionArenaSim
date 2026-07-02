import { Card } from "./Card";
import { CharacterCard } from "./CharacterCard";

export class CardInstance {
  public usedEffectIdsThisTurn = new Set<string>();
  public cannotBeBlockedByMinBp?: number;

  /** このターンにアタックした回数 */
  public attackedThisTurnCount: number = 0;

  /** このターンにブロックした回数 */
  public blockedThisTurnCount: number = 0;

  constructor(
    public readonly instanceId: number,
    public readonly card: Card,
    public isRest: boolean = false,
    public temporaryBpBonus: number = 0
  ) {}

  public getCurrentBp(): number {
    if (!(this.card instanceof CharacterCard)) {
      throw new Error("Only character cards have BP.");
    }

    return this.card.bp + this.temporaryBpBonus;
  }
}