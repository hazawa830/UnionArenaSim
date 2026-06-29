export class ActionPointRule {
  public static calculate(isFirstPlayer: boolean, playerTurnCount: number): number {
    if (isFirstPlayer) {
      return Math.min(playerTurnCount, 3);
    }

    if (playerTurnCount === 1) {
      return 2;
    }

    return Math.min(playerTurnCount, 3);
  }
}