import { Player } from "./Player";
import { GameSetup } from "./GameSetup";
import { TurnManager } from "../rules/TurnManager";

import { GamePhase } from "../enum/GamePhase";
import { PlayerId } from "../enum/PlayerId";
import { StartPhaseAction } from "../actions/StartPhaseAction";

export class Game {
  public readonly player1: Player;
  public readonly player2: Player;

  public currentPlayerId: PlayerId;
  public phase: GamePhase;
  public winner?: PlayerId;
  public turnCount: number;
  public firstPlayerId: PlayerId;

  constructor(player1: Player, player2: Player) {
    this.player1 = player1;
    this.player2 = player2;

    this.currentPlayerId =
      Math.random() < 0.5 ? PlayerId.Player1 : PlayerId.Player2;

    this.phase = GamePhase.Start;
    this.winner = undefined;
    this.turnCount = 1;
    this.firstPlayerId = this.currentPlayerId;
  }

  public start(): void {
    GameSetup.setup(this.player1, this.player2);
    this.phase = GamePhase.Start;
    StartPhaseAction.execute(this);
  }

  public getCurrentPlayer(): Player {
    return this.currentPlayerId === PlayerId.Player1
      ? this.player1
      : this.player2;
  }

  public getOpponentPlayer(): Player {
    return this.currentPlayerId === PlayerId.Player1
      ? this.player2
      : this.player1;
  }

  public nextPhase(): void {
    TurnManager.nextPhase(this);
  }
}