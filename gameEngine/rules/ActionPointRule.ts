export class ActionPointRule {
  public static calculate(isFirstPlayer: boolean, turnCount: number): number {
    if (isFirstPlayer) {
      return Math.min(turnCount, 3);
    }

    if (turnCount === 1) {
      return 2;
    }

    return Math.min(turnCount, 3);
  }
}