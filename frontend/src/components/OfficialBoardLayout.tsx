import { Game } from "../../../gameEngine/core/Game";
import { Player } from "../../../gameEngine/core/Player";
import { CardInstance } from "../../../gameEngine/cards/CardInstance";
import { BoardLine } from "../../../gameEngine/enum/BoardLine";

import { PlayerView } from "./PlayerView";
import { HandView } from "./HandView";
import { CompactPlayerInfo } from "./CompactPlayerInfo";
import { BlockPanel } from "./BlockPanel";
import { CardChoicePanel } from "./CardChoicePanel";
import type { PendingCardChoice } from "./CardChoicePanel";
import { TurnControls } from "./TurnControls";
import { CurrentTriggerPanel } from "./CurrentTriggerPanel";

import type { PendingRaidTriggerBase } from "../types/PendingInteraction";

type PendingRaid = {
  handIndex: number;
} | null;

type PendingRaidBase = {
  handIndex: number;
  baseLine: BoardLine;
  baseIndex: number;
} | null;

type PendingSelection = {
  source: "event" | "activateMain" | "trigger" | "effect";
  handIndex?: number;
  requiredCount: number;
  selectedTargets: CardInstance[];
  allowedSide: "own" | "opponent" | "both";
  allowedLines: BoardLine[];
} | null;

type Props = {
  game: Game;
  player1: Player;
  player2: Player;
  currentPlayer: Player;

  isYourTurn: boolean;
  isGameOver: boolean;

  pendingAttack: number | null;
  pendingRaid: PendingRaid;
  pendingRaidBase: PendingRaidBase;
  pendingSelection: PendingSelection;
  pendingCardChoice: PendingCardChoice | null;
  pendingRaidTriggerBase: PendingRaidTriggerBase;

  hoveredCardImage: string | null;
  isRaidTriggerBaseSelecting: boolean;
  canCancelCardChoice?: boolean;

  onHoverImage: (imagePath: string | null) => void;

  onNextPhase: () => void;
  onExtraDraw: () => void;

  onMoveToFront: (energyIndex: number) => void;
  onMoveToEnergy: (frontIndex: number) => void;
  onAttack: (frontIndex: number) => void;

  onPlayToEnergy: (handIndex: number) => void;
  onPlayToFront: (handIndex: number) => void;
  onUseEvent: (handIndex: number) => void;

  onStartRaid: (handIndex: number) => void;
  onSelectRaidBase: (
    line: BoardLine,
    index: number
  ) => void;

  onSelectTarget: (
    side: "own" | "opponent",
    line: BoardLine,
    index: number
  ) => void;

  onNoBlock: () => void;
  onBlock: (blockerIndex: number) => void;

  onToggleChoiceCard: (
    card: CardInstance
  ) => void;
  onConfirmCardChoice: () => void;
  onCancelCardChoice: () => void;

  onStartActivateMain: (
    line: BoardLine,
    index: number
  ) => void;

  onStartTriggerChoice: () => void;
  onDeclineTriggerChoice: () => void;
  onStartRaidTrigger: () => void;
  onDeclineRaidTrigger: () => void;

  onOpenTrashViewer: (
    playerId: string
  ) => void;

  onCancelSelection: () => void;

  onSelectRaidTriggerDestination: (
    destinationLine: BoardLine,
    destinationIndex?: number
  ) => void;
};

export function OfficialBoardLayout({
  game,
  player1,
  player2,
  currentPlayer,

  isYourTurn,
  isGameOver,

  pendingAttack,
  pendingRaid,
  pendingRaidBase,
  pendingSelection,
  pendingCardChoice,
  pendingRaidTriggerBase,

  hoveredCardImage,
  isRaidTriggerBaseSelecting,
  canCancelCardChoice = true,

  onHoverImage,

  onNextPhase,
  onExtraDraw,

  onMoveToFront,
  onMoveToEnergy,
  onAttack,

  onPlayToEnergy,
  onPlayToFront,
  onUseEvent,

  onStartRaid,
  onSelectRaidBase,
  onSelectTarget,

  onNoBlock,
  onBlock,

  onToggleChoiceCard,
  onConfirmCardChoice,
  onCancelCardChoice,

  onStartActivateMain,

  onStartTriggerChoice,
  onDeclineTriggerChoice,
  onStartRaidTrigger,
  onDeclineRaidTrigger,

  onOpenTrashViewer,
  onCancelSelection,

  onSelectRaidTriggerDestination,
}: Props) {
  const isTargetSelecting =
    pendingSelection !== null;

  return (
    <>
      
      

      <div className="official-layout">
        <div className="official-left-cluster">
          <div className="official-trigger-slot">
            <CurrentTriggerPanel
              game={game}
              onStartTriggerChoice={onStartTriggerChoice}
              onDeclineTriggerChoice={onDeclineTriggerChoice}
              onStartRaidTrigger={onStartRaidTrigger}
              onDeclineRaidTrigger={onDeclineRaidTrigger}
            />
          </div>

          <aside className="official-side official-side-left">
          <CardChoicePanel
            choice={pendingCardChoice}
            onToggleCard={
              onToggleChoiceCard
            }
            onConfirm={
              onConfirmCardChoice
            }
            onCancel={
              onCancelCardChoice
            }
            onHoverImage={
              onHoverImage
            }
            canCancel={
              canCancelCardChoice
            }
          />

          {!pendingCardChoice && (
            <>
              <CompactPlayerInfo
                title="Opponent"
                player={player2}
                onOpenTrash={() =>
                  onOpenTrashViewer(
                    player2.id
                  )
                }
              />

              <CompactPlayerInfo
                title="You"
                player={player1}
                onOpenTrash={() =>
                  onOpenTrashViewer(
                    player1.id
                  )
                }
              />
            </>
          )}
          </aside>
        </div>

        <main className="official-board">
          <section className="official-player-area opponent-area">
            <div className="zone-label">
              Opponent
            </div>

            <PlayerView
              title="Opponent"
              player={player2}
              reverseLines
              isTargetSelecting={
                isTargetSelecting
              }
              targetSide="opponent"
              onSelectTarget={
                onSelectTarget
              }
              onHoverImage={
                onHoverImage
              }
              opponent={player1}
              game={game}
            />
          </section>

          <section className="official-center-panel">
            {pendingRaid &&
              !pendingRaidBase && (
                <div className="selection-hint">
                  レイド元選択中
                </div>
              )}

            {pendingRaidBase && (
              <div className="selection-hint">
                登場先選択中
              </div>
            )}

            {pendingSelection && (
              <div className="center-selection-panel">
                <div className="selection-hint">
                  対象を選択してください
                </div>

                <div className="center-selection-count">
                  {
                    pendingSelection
                      .selectedTargets
                      .length
                  }
                  /
                  {
                    pendingSelection
                      .requiredCount
                  }
                </div>

                <button
                  type="button"
                  className="center-cancel-button"
                  onClick={
                    onCancelSelection
                  }
                >
                  Cancel
                </button>
              </div>
            )}

            {!pendingRaid &&
              !pendingRaidBase &&
              !pendingRaidTriggerBase &&
              !pendingSelection && (
                <div className="selection-hint idle-hint">
                  操作待ち
                </div>
              )}

            {pendingRaidTriggerBase && (
              <div className="raid-trigger-destination-inline">
                <div className="selection-hint">
                  レイドトリガー登場先を選択
                </div>

                <div className="raid-trigger-destination-buttons">
                  <button
                    type="button"
                    onClick={() =>
                      onSelectRaidTriggerDestination(
                        BoardLine.EnergyLine,
                        pendingRaidTriggerBase.baseIndex
                      )
                    }
                  >
                    Energy Lineに登場
                  </button>

                  {player1.board.frontLine.map(
                    (slot, index) => (
                      <button
                        type="button"
                        key={index}
                        disabled={
                          !slot.isEmpty()
                        }
                        onClick={() =>
                          onSelectRaidTriggerDestination(
                            BoardLine.FrontLine,
                            index
                          )
                        }
                      >
                        Front {index + 1}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </section>

          {pendingAttack !== null && (
            <section className="official-block-panel">
              <BlockPanel
                attackerIndex={
                  pendingAttack
                }
                player={player1}
                isGameOver={
                  isGameOver
                }
                onNoBlock={
                  onNoBlock
                }
                onBlock={
                  onBlock
                }
              />
            </section>
          )}

          <section className="official-player-area own-area">
            <div className="zone-label">
              You
            </div>

            <PlayerView
              title="You"
              player={player1}
              isYou
              isRaidBaseSelecting={
                (
                  pendingRaid !== null &&
                  pendingRaidBase === null
                ) ||
                isRaidTriggerBaseSelecting
              }
              isTargetSelecting={
                isTargetSelecting
              }
              targetSide="own"
              onSelectRaidBase={
                onSelectRaidBase
              }
              onSelectTarget={
                onSelectTarget
              }
              onMoveToFront={
                onMoveToFront
              }
              onAttack={
                onAttack
              }
              onHoverImage={
                onHoverImage
              }
              onStartActivateMain={
                onStartActivateMain
              }
              opponent={player2}
              game={game}
              onMoveToEnergy={
                onMoveToEnergy
              }
            />
          </section>

          <section className="official-hand-area">
            <div className="zone-label">
              Hand
            </div>

            <HandView
              player={player1}
              isYourTurn={
                isYourTurn
              }
              isGameOver={
                isGameOver
              }
              onPlayToEnergy={
                onPlayToEnergy
              }
              onPlayToFront={
                onPlayToFront
              }
              onUseEvent={
                onUseEvent
              }
              onStartRaid={
                onStartRaid
              }
              onHoverImage={
                onHoverImage
              }
            />
          </section>
        </main>

        <aside className="official-side official-side-right">
          <section className="official-log-panel">
            <h2>Log</h2>

            <div className="log-list">
              {game.logs
                .slice(-30)
                .map((log) => (
                  <div
                    key={log.id}
                    className={
                      `log-item log-${log.type}`
                    }
                  >
                    <span className="log-id">
                      #{log.id}
                    </span>{" "}

                    <span className="log-message">
                      {log.message}
                    </span>
                  </div>
                ))}
            </div>
          </section>

          <TurnControls
            game={game}
            currentPlayer={
              currentPlayer
            }
            isYourTurn={
              isYourTurn
            }
            isGameOver={
              isGameOver
            }
            onNextPhase={
              onNextPhase
            }
            onExtraDraw={
              onExtraDraw
            }
          />
        </aside>

        {/*
         * ログのさらに右側へ、
         * ホバー画像専用カラムを設置する。
         */}
        <aside className="official-preview-side">
          {hoveredCardImage && (
            <section className="hover-card-preview">
              <img
                src={hoveredCardImage}
                className="card-preview-image"
                alt="card preview"
              />
            </section>
          )}
        </aside>
      </div>
    </>
  );
}