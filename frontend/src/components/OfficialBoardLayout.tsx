import { Game } from "../../../gameEngine/core/Game";
import { Player } from "../../../gameEngine/core/Player";
import { CardInstance } from "../../../gameEngine/cards/CardInstance";
import { BoardLine } from "../../../gameEngine/enum/BoardLine";
import { GamePhase } from "../../../gameEngine/enum/GamePhase";

import { PlayerView } from "./PlayerView";
import { HandView } from "./HandView";
import { CompactPlayerInfo } from "./CompactPlayerInfo";
import { BlockPanel } from "./BlockPanel";
import {
  CardChoicePanel} from "./CardChoicePanel";
import type { PendingCardChoice } from "./CardChoicePanel";

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
  hoveredCardImage: string | null;
  

  onHoverImage: (imagePath: string | null) => void;
  onNextPhase: () => void;
  onExtraDraw: () => void;
  onMoveToFront: (energyIndex: number) => void;
  onAttack: (frontIndex: number) => void;
  onPlayToEnergy: (handIndex: number) => void;
  onPlayToFront: (handIndex: number) => void;
  onUseEvent: (handIndex: number) => void;
  onStartRaid: (handIndex: number) => void;
  onSelectRaidBase: (line: BoardLine, index: number) => void;
  onSelectTarget: (
    side: "own" | "opponent",
    line: BoardLine,
    index: number
  ) => void;
  onNoBlock: () => void;
  onBlock: (blockerIndex: number) => void;
  pendingCardChoice: PendingCardChoice | null;
  onToggleChoiceCard: (card: CardInstance) => void;
  onConfirmCardChoice: () => void;
  onCancelCardChoice: () => void;
  onStartActivateMain: (line: BoardLine, index: number) => void;
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
  hoveredCardImage,
  onHoverImage,
  onNextPhase,
  onExtraDraw,
  onMoveToFront,
  onAttack,
  onPlayToEnergy,
  onPlayToFront,
  onUseEvent,
  onStartRaid,
  onSelectRaidBase,
  onSelectTarget,
  onNoBlock,
  onBlock,
  pendingCardChoice,
  onToggleChoiceCard,
  onConfirmCardChoice,
  onCancelCardChoice,
  onStartActivateMain,
}: Props) {
  const isTargetSelecting = pendingSelection !== null;

  return (
    <div className="official-layout">
      <aside className="official-side official-side-left">
        <CardChoicePanel
          choice={pendingCardChoice}
          onToggleCard={onToggleChoiceCard}
          onConfirm={onConfirmCardChoice}
          onCancel={onCancelCardChoice}
          onHoverImage={onHoverImage}
        />

        {!pendingCardChoice && (
          <>
            <CompactPlayerInfo title="Opponent" player={player2} />
            <CompactPlayerInfo title="You" player={player1} />
          </>
        )}
      </aside>

      <main className="official-board">
        <section className="official-player-area opponent-area">
          <div className="zone-label">Opponent</div>
          <PlayerView
            title="Opponent"
            player={player2}
            reverseLines
            isTargetSelecting={isTargetSelecting}
            targetSide="opponent"
            onSelectTarget={onSelectTarget}
            onHoverImage={onHoverImage}
          />
        </section>

        <section className="official-center-panel">
          <div>
            <strong>Turn:</strong> {game.turnCount}
          </div>
          <div>
            <strong>Phase:</strong> {game.phase}
          </div>
          <div>
            <strong>Current:</strong> {currentPlayer.name}
          </div>

          {pendingRaid && !pendingRaidBase && (
            <div className="selection-hint">レイド元選択中</div>
          )}

          {pendingRaidBase && (
            <div className="selection-hint">登場先選択中</div>
          )}

          {pendingSelection && (
            <div className="selection-hint">
              対象選択中 {pendingSelection.selectedTargets.length}/
              {pendingSelection.requiredCount}
            </div>
          )}

          <button onClick={onNextPhase} disabled={isGameOver}>
            Next Phase
          </button>

          {isYourTurn && game.phase === GamePhase.Start && (
            <button onClick={onExtraDraw} disabled={isGameOver}>
              Extra Draw - AP1
            </button>
          )}
        </section>

        {pendingAttack !== null && (
          <section className="official-block-panel">
            <BlockPanel
              attackerIndex={pendingAttack}
              player={player1}
              isGameOver={isGameOver}
              onNoBlock={onNoBlock}
              onBlock={onBlock}
            />
          </section>
        )}

        <section className="official-player-area own-area">
          <div className="zone-label">You</div>
          <PlayerView
            title="You"
            player={player1}
            isYou
            isRaidBaseSelecting={
              pendingRaid !== null && pendingRaidBase === null
            }
            isTargetSelecting={isTargetSelecting}
            targetSide="own"
            onSelectRaidBase={onSelectRaidBase}
            onSelectTarget={onSelectTarget}
            onMoveToFront={onMoveToFront}
            onAttack={onAttack}
            onHoverImage={onHoverImage}
            onStartActivateMain={onStartActivateMain}
          />
        </section>

        <section className="official-hand-area">
          <div className="zone-label">Hand</div>
          <HandView
            player={player1}
            isYourTurn={isYourTurn}
            isGameOver={isGameOver}
            onPlayToEnergy={onPlayToEnergy}
            onPlayToFront={onPlayToFront}
            onUseEvent={onUseEvent}
            onStartRaid={onStartRaid}
            onHoverImage={onHoverImage}
          />
        </section>
      </main>

      <aside className="official-side official-side-right">
        <section className="official-log-panel">
          <h2>Log</h2>
          <div className="log-list">
            {game.logs.slice(-30).map((log) => (
              <div key={log.id} className={`log-item log-${log.type}`}>
                <span className="log-id">#{log.id}</span>{" "}
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        </section>

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
  );
}