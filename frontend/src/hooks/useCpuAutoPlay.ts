import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

import { Game } from "../../../gameEngine/core/Game";
import { GamePhase } from "../../../gameEngine/enum/GamePhase";
import { RandomCPU } from "../../../gameEngine/cpu/RandomCPU";
import { SimulationCPU } from "../../../gameEngine/cpu/SimulationCPU";
import type { CpuMode } from "../../../gameEngine/cpu/CpuMode";

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
  cpuMode,
}: Props) {
  useEffect(() => {
    if (game.winner) return;

    const hasCpuPendingChoice =
      game.pendingRaidTrigger?.playerId === player2Id ||
      game.pendingTriggerChoice?.playerId === player2Id;

    if (currentPlayerId !== player2Id && !hasCpuPendingChoice) return;

    if (pendingAttack !== null) return;
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
      const currentPlayerNow = game.getCurrentPlayer();
      const isCpuTurnNow = currentPlayerNow.id === player2Id;

      const hasCpuPendingChoiceNow =
        game.pendingRaidTrigger?.playerId === player2Id ||
        game.pendingTriggerChoice?.playerId === player2Id;

      const hasPlayerPendingChoiceNow =
        game.pendingRaidTrigger?.playerId === player1Id ||
        game.pendingTriggerChoice?.playerId === player1Id;

      if (game.winner) {
        return;
      }

      if (hasPlayerPendingChoiceNow) {
        return;
      }

      if (!isCpuTurnNow && !hasCpuPendingChoiceNow) {
        return;
      }

      // pending trigger / raid trigger の自動解決。
      // SimulationCPU.playPhase 内でも resolvePendingChoices は呼ぶが、
      // CPUターン外でCPU側のトリガーだけ解決したいケースがあるためここは残す。
      if (RandomCPU.resolvePendingChoices(game)) {
        refresh();
        setCpuTick((x) => x + 1);
        return;
      }

      if (!isCpuTurnNow) {
        return;
      }

      // ここは既存仕様を維持。
      // CPUの攻撃は即解決せず、プレイヤーにブロック選択を出すため pendingAttack にする。
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
      setCpuTick((x) => x + 1);
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
  ]);
}