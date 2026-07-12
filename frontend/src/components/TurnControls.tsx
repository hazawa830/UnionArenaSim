import { Game } from "../../../gameEngine/core/Game";
import { Player } from "../../../gameEngine/core/Player";
import { GamePhase } from "../../../gameEngine/enum/GamePhase";

type Props = {
  game: Game;
  currentPlayer: Player;
  isYourTurn: boolean;
  isGameOver: boolean;
  onNextPhase: () => void;
  onExtraDraw: () => void;
};

function getPhaseLabel(phase: GamePhase): string {
  switch (phase) {
    case GamePhase.Start:
      return "Start Phase";
    case GamePhase.Move:
      return "Move Phase";
    case GamePhase.Main:
      return "Main Phase";
    case GamePhase.Attack:
      return "Attack Phase";
    case GamePhase.End:
      return "End Phase";
    default:
      return String(phase);
  }
}

function getNextButtonLabel(phase: GamePhase): string {
  switch (phase) {
    case GamePhase.Start:
      return "To Move Phase";
    case GamePhase.Move:
      return "To Main Phase";
    case GamePhase.Main:
      return "To Attack Phase";
    case GamePhase.Attack:
      return "To End Phase";
    case GamePhase.End:
      return "End Turn";
    default:
      return "Next Phase";
  }
}

export function TurnControls({
  game,
  currentPlayer,
  isYourTurn,
  isGameOver,
  onNextPhase,
  onExtraDraw,
}: Props) {
  return (
    <section className="turn-controls-panel">
      <div className="turn-controls-header">
        {isYourTurn ? "YOUR TURN" : "OPPONENT TURN"}
      </div>

      <div className="turn-controls-info">
        <div className="turn-info-row">
          <span>Phase</span>
          <strong>{getPhaseLabel(game.phase)}</strong>
        </div>

        <div className="turn-info-row">
          <span>Current</span>
          <strong>{currentPlayer.name}</strong>
        </div>
      </div>

      <button
        className="primary-turn-button"
        onClick={onNextPhase}
        disabled={isGameOver}
      >
        {getNextButtonLabel(game.phase)}
      </button>

      {isYourTurn && game.phase === GamePhase.Start && (
        <button
          className="secondary-turn-button"
          onClick={onExtraDraw}
          disabled={isGameOver}
        >
          Extra Draw - AP1
        </button>
      )}
    </section>
  );
}