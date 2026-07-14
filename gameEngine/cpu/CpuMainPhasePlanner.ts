import { Game } from "../core/Game";
import { GameCloner } from "../core/GameCloner";
import { GamePhase } from "../enum/GamePhase";
import { BoardLine } from "../enum/BoardLine";

import type { CpuAction } from "./CpuAction";
import { CpuActionGenerator } from "./CpuActionGenerator";
import { CpuActionExecutor } from "./CpuActionExecutor";
import { GameStateEvaluator } from "./GameStateEvaluator";

type PlayCardCpuAction = Extract<
  CpuAction,
  { type: "playCard" }
>;

type MainPhasePlan = {
  actions: CpuAction[];
  spentAp: number;
  remainingAp: number;
  finalScore: number;

  frontPlayedCount: number;
  energyPlayedCount: number;
  highestFrontRequiredEnergy: number;
  totalFrontPlayedBp: number;

  handCount: number;
  currentEnergyCount: number;
  highestHandRequiredEnergy: number;
  energyProgressScore: number;
};

type SearchState = {
  actions: CpuAction[];
  frontPlayedCount: number;
  energyPlayedCount: number;
  highestFrontRequiredEnergy: number;
  totalFrontPlayedBp: number;
};

export class CpuMainPhasePlanner {
  public static chooseNextAction(
    game: Game
  ): CpuAction | null {
    if (game.phase !== GamePhase.Main) {
      return null;
    }

    const player = game.getCurrentPlayer();
    const playerId = player.id;
    const initialAp =
      player.board.activeActionPoint;

    const plans = this.searchPlans(
      game,
      playerId,
      initialAp,
      {
        actions: [],
        frontPlayedCount: 0,
        energyPlayedCount: 0,
        highestFrontRequiredEnergy: 0,
        totalFrontPlayedBp: 0,
      },
      0
    ).filter(
      (plan) => plan.actions.length > 0
    );

    if (plans.length === 0) {
      return null;
    }

    plans.sort(
      (a, b) => this.comparePlans(a, b)
    );

    const bestPlan = plans[0];

    console.log(
      "CPU Main plans",
      plans.slice(0, 10).map((plan) => ({
        spentAp: plan.spentAp,
        remainingAp: plan.remainingAp,
        handCount: plan.handCount,
        currentEnergyCount:
          plan.currentEnergyCount,
        highestHandRequiredEnergy:
          plan.highestHandRequiredEnergy,
        energyProgressScore:
          plan.energyProgressScore,
        frontPlayedCount:
          plan.frontPlayedCount,
        energyPlayedCount:
          plan.energyPlayedCount,
        highestFrontRequiredEnergy:
          plan.highestFrontRequiredEnergy,
        totalFrontPlayedBp:
          plan.totalFrontPlayedBp,
        finalScore: plan.finalScore,
        actions: plan.actions,
      }))
    );

    console.log(
      "CPU selected main plan",
      {
        spentAp: bestPlan.spentAp,
        remainingAp: bestPlan.remainingAp,
        handCount: bestPlan.handCount,
        currentEnergyCount:
          bestPlan.currentEnergyCount,
        highestHandRequiredEnergy:
          bestPlan.highestHandRequiredEnergy,
        energyProgressScore:
          bestPlan.energyProgressScore,
        frontPlayedCount:
          bestPlan.frontPlayedCount,
        energyPlayedCount:
          bestPlan.energyPlayedCount,
        highestFrontRequiredEnergy:
          bestPlan.highestFrontRequiredEnergy,
        totalFrontPlayedBp:
          bestPlan.totalFrontPlayedBp,
        actions: bestPlan.actions,
      }
    );

    return bestPlan.actions[0] ?? null;
  }

  private static searchPlans(
    game: Game,
    playerId: string,
    initialAp: number,
    state: SearchState,
    depth: number
  ): MainPhasePlan[] {
    const player = game.getCurrentPlayer();

    const currentAp =
      player.board.activeActionPoint;

    const spentAp =
      initialAp - currentAp;

    const currentEnergyCount =
      player.board.energyLine.filter(
        (slot) => !slot.isEmpty()
      ).length;

    const highestHandRequiredEnergy =
      player.board.hand.reduce(
        (highest, card) =>
          Math.max(
            highest,
            card.card.requiredEnergy.getTotal()
          ),
        0
      );

    const energyProgressScore =
      this.calculateEnergyProgressScore(
        currentEnergyCount,
        highestHandRequiredEnergy
      );

    const plans: MainPhasePlan[] = [
      {
        actions: state.actions,
        spentAp,
        remainingAp: currentAp,
        finalScore:
          GameStateEvaluator.evaluate(
            game,
            playerId
          ),

        frontPlayedCount:
          state.frontPlayedCount,
        energyPlayedCount:
          state.energyPlayedCount,
        highestFrontRequiredEnergy:
          state.highestFrontRequiredEnergy,
        totalFrontPlayedBp:
          state.totalFrontPlayedBp,

        handCount:
          player.board.hand.length,
        currentEnergyCount,
        highestHandRequiredEnergy,
        energyProgressScore,
      },
    ];

    /*
     * 最大APが3なので、通常は深度3で十分。
     */
    if (
      depth >= 3 ||
      currentAp <= 0
    ) {
      return plans;
    }

    /*
     * Plannerは通常のカードプレイだけを対象にする。
     *
     * レイドはSimulationCPU側で、
     * 通常行動と比較して判断する。
     */
    const actions =
      CpuActionGenerator.generate(game).filter(
        (
          action
        ): action is PlayCardCpuAction =>
          action.type === "playCard"
      );

    for (const action of actions) {
      const card =
        player.board.hand[action.handIndex];

      if (!card) {
        continue;
      }

      const requiredEnergy =
        card.card.requiredEnergy.getTotal();

      const bp =
        "bp" in card.card &&
        typeof card.card.bp === "number"
          ? card.card.bp
          : 0;

      const clonedGame =
        GameCloner.clone(game);

      const beforeAp =
        clonedGame
          .getCurrentPlayer()
          .board.activeActionPoint;

      const succeeded =
        CpuActionExecutor.tryExecute(
          clonedGame,
          action
        );

      if (!succeeded) {
        continue;
      }

      const afterAp =
        clonedGame
          .getCurrentPlayer()
          .board.activeActionPoint;

      /*
       * APを消費しなかった場合は
       * 再帰対象にしない。
       */
      if (afterAp >= beforeAp) {
        continue;
      }

      /*
       * 選択待ちが発生するカードは
       * Plannerの対象外。
       */
      if (
        clonedGame.pendingTriggerChoice ||
        clonedGame.pendingRaidTrigger
      ) {
        continue;
      }

      const isFrontPlay =
        action.destination ===
        BoardLine.FrontLine;

      const isEnergyPlay =
        action.destination ===
        BoardLine.EnergyLine;

      const nextState: SearchState = {
        actions: [
          ...state.actions,
          action,
        ],

        frontPlayedCount:
          state.frontPlayedCount +
          (isFrontPlay ? 1 : 0),

        energyPlayedCount:
          state.energyPlayedCount +
          (isEnergyPlay ? 1 : 0),

        highestFrontRequiredEnergy:
          isFrontPlay
            ? Math.max(
                state.highestFrontRequiredEnergy,
                requiredEnergy
              )
            : state.highestFrontRequiredEnergy,

        totalFrontPlayedBp:
          state.totalFrontPlayedBp +
          (isFrontPlay ? bp : 0),
      };

      plans.push(
        ...this.searchPlans(
          clonedGame,
          playerId,
          initialAp,
          nextState,
          depth + 1
        )
      );
    }

    return plans;
  }

  private static calculateEnergyProgressScore(
    currentEnergyCount: number,
    highestHandRequiredEnergy: number
  ): number {
    if (highestHandRequiredEnergy <= 0) {
      return 0;
    }

    const targetEnergy = Math.min(
      highestHandRequiredEnergy,
      4
    );

    if (
      currentEnergyCount >= targetEnergy
    ) {
      return 1000;
    }

    return currentEnergyCount * 200;
  }

  private static comparePlans(
    a: MainPhasePlan,
    b: MainPhasePlan
  ): number {
    /*
     * 1. APをより多く使ったプラン。
     */
    if (a.spentAp !== b.spentAp) {
      return b.spentAp - a.spentAp;
    }

    /*
     * 2. 手札をより多く減らしたプラン。
     */
    if (a.handCount !== b.handCount) {
      return a.handCount - b.handCount;
    }

    /*
     * 3. 将来必要になるエナジーへ
     * より近づいたプラン。
     */
    if (
      a.energyProgressScore !==
      b.energyProgressScore
    ) {
      return (
        b.energyProgressScore -
        a.energyProgressScore
      );
    }

    /*
     * 4. 現在のエナジー枚数。
     */
    if (
      a.currentEnergyCount !==
      b.currentEnergyCount
    ) {
      return (
        b.currentEnergyCount -
        a.currentEnergyCount
      );
    }

    /*
     * 5. より高エナジーのカードを
     * フロントへ出したプラン。
     */
    if (
      a.highestFrontRequiredEnergy !==
      b.highestFrontRequiredEnergy
    ) {
      return (
        b.highestFrontRequiredEnergy -
        a.highestFrontRequiredEnergy
      );
    }

    /*
     * 6. フロントへ出したBP合計。
     */
    if (
      a.totalFrontPlayedBp !==
      b.totalFrontPlayedBp
    ) {
      return (
        b.totalFrontPlayedBp -
        a.totalFrontPlayedBp
      );
    }

    /*
     * 7. フロントへ出した枚数。
     */
    if (
      a.frontPlayedCount !==
      b.frontPlayedCount
    ) {
      return (
        b.frontPlayedCount -
        a.frontPlayedCount
      );
    }

    /*
     * 8. 最終的な盤面評価。
     */
    return b.finalScore - a.finalScore;
  }
}