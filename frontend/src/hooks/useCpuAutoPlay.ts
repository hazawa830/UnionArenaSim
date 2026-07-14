import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

import { Game } from "../../../gameEngine/core/Game";
import { GamePhase } from "../../../gameEngine/enum/GamePhase";
import { RandomCPU } from "../../../gameEngine/cpu/RandomCPU";
import { SimulationCPU } from "../../../gameEngine/cpu/SimulationCPU";
import type { CpuMode } from "../../../gameEngine/cpu/CpuMode";
import { CpuBlockDecider } from "../../../gameEngine/cpu/CpuBlockDecider";

type Props = {
  game: Game;
  player1Id: string;
  player2Id: string;
  currentPlayerId: string;
  pendingAttack: number | null;
  pendingRaid: unknown;
  pendingRaidBase: unknown;
  pendingSelection: unknown;
  pendingCardChoice: unknown;
  pendingActivateMain: unknown;
  pendingPlayDestination: unknown;
  isSelectingRaidTriggerBase: boolean;
  pendingRaidTriggerBase: unknown;
  cpuTick: number;
  setCpuTick: Dispatch<SetStateAction<number>>;
  setPendingAttack: Dispatch<SetStateAction<number | null>>;
  cpuMode: CpuMode;
  refresh: () => void;
  onCpuBlock: (blockerIndex: number) => void;
  onCpuNoBlock: () => void;
};

export function useCpuAutoPlay({
  game,
  player1Id,
  player2Id,
  currentPlayerId,
  pendingAttack,
  pendingRaid,
  pendingRaidBase,
  pendingSelection,
  pendingCardChoice,
  pendingActivateMain,
  pendingPlayDestination,
  isSelectingRaidTriggerBase,
  pendingRaidTriggerBase,
  cpuTick,
  setCpuTick,
  setPendingAttack,
  refresh,
  onCpuBlock,
  onCpuNoBlock,
  cpuMode,
}: Props) {
  useEffect(() => {
    if (game.winner) {
      return;
    }

    const hasCpuPendingChoice =
      game.pendingRaidTrigger?.playerId === player2Id ||
      game.pendingTriggerChoice?.playerId === player2Id;

    /*
     * プレイヤーが攻撃側でpendingAttackがある場合、
     * CPUが防御判断を行う必要がある。
     */
    const shouldHandleCpuDefense =
      pendingAttack !== null && currentPlayerId === player1Id;

    /*
     * CPUターンでもCPU側選択待ちでもなく、
     * CPU防御処理もない場合は何もしない。
     */
    if (
      currentPlayerId !== player2Id &&
      !hasCpuPendingChoice &&
      !shouldHandleCpuDefense
    ) {
      return;
    }

    /*
     * CPUが攻撃側のpendingAttackは、
     * プレイヤーがブロックを選択するため自動処理しない。
     */
    if (pendingAttack !== null && !shouldHandleCpuDefense) {
      return;
    }

    if (pendingRaid !== null) return;
    if (pendingRaidBase !== null) return;
    if (pendingSelection !== null) return;
    if (pendingCardChoice !== null) return;
    if (pendingActivateMain !== null) return;
    if (pendingPlayDestination !== null) return;
    if (game.pendingRaidTrigger?.playerId === player1Id) return;
    if (game.pendingTriggerChoice?.playerId === player1Id) return;
    if (isSelectingRaidTriggerBase) return;
    if (pendingRaidTriggerBase !== null) return;

    const timer = setTimeout(() => {
      if (game.winner) {
        return;
      }

      const currentPlayerNow = game.getCurrentPlayer();
      const isCpuTurnNow = currentPlayerNow.id === player2Id;

      const hasCpuPendingChoiceNow =
        game.pendingRaidTrigger?.playerId === player2Id ||
        game.pendingTriggerChoice?.playerId === player2Id;

      const hasPlayerPendingChoiceNow =
        game.pendingRaidTrigger?.playerId === player1Id ||
        game.pendingTriggerChoice?.playerId === player1Id;

      /*
       * プレイヤーの攻撃に対するCPUのブロック判断。
       */
      if (pendingAttack !== null) {
        const isPlayerAttackingNow = currentPlayerNow.id === player1Id;

        /*
         * CPUが攻撃側なら、プレイヤーのブロック選択を待つ。
         */
        if (!isPlayerAttackingNow) {
          return;
        }

        const blockerIndex = CpuBlockDecider.chooseBlockerIndex(
          game,
          player1Id,
          player2Id,
          pendingAttack
        );

        if (blockerIndex !== null) {
          onCpuBlock(blockerIndex);
        } else {
          onCpuNoBlock();
        }

        refresh();
        setCpuTick((value) => value + 1);
        return;
      }

      if (hasPlayerPendingChoiceNow) {
        return;
      }

      if (!isCpuTurnNow && !hasCpuPendingChoiceNow) {
        return;
      }

      /*
       * CPU側のトリガー・レイドトリガー選択を解決。
       */
      if (RandomCPU.resolvePendingChoices(game)) {
        refresh();
        setCpuTick((value) => value + 1);
        return;
      }

      if (!isCpuTurnNow) {
        return;
      }

      /*
       * CPUの攻撃は即時解決せず、
       * プレイヤーにブロック選択を表示する。
       */
      if (game.phase === GamePhase.Attack) {
        const attackerIndex = game.player2.board.frontLine.findIndex((slot) => {
          const card = slot.getCard();

          return card && !card.isRest;
        });

        if (attackerIndex !== -1) {
          setPendingAttack(attackerIndex);
          return;
        }
      }

      if (cpuMode === "simulation") {
        SimulationCPU.playPhase(game, {
          simulationsPerAction: 2,
          playoutSteps: 4,
        });
      } else {
        RandomCPU.playPhase(game);
      }

      refresh();
      setCpuTick((value) => value + 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [
    game,
    game.phase,
    game.currentPlayerId,
    game.winner,
    game.pendingRaidTrigger,
    game.pendingTriggerChoice,
    player1Id,
    player2Id,
    currentPlayerId,
    pendingAttack,
    pendingRaid,
    pendingRaidBase,
    pendingSelection,
    pendingCardChoice,
    pendingActivateMain,
    pendingPlayDestination,
    isSelectingRaidTriggerBase,
    pendingRaidTriggerBase,
    cpuTick,
    cpuMode,
    refresh,
    setCpuTick,
    setPendingAttack,
    onCpuBlock,
    onCpuNoBlock,
  ]);
}