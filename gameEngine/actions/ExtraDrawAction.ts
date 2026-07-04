import { Game } from "../core/Game";
import { GamePhase } from "../enum/GamePhase";
import { ActionSource } from "../enum/ActionSource";
import { GameLogger } from "../log/GameLogger";
import { LogType } from "../enum/LogType";
import { EffectLogType } from "../enum/EffectLogType";

export class ExtraDrawAction {
  public static execute(
    game: Game,
    source: ActionSource = ActionSource.PlayerNormal
  ): void {
    if (
      source === ActionSource.PlayerNormal &&
      game.phase !== GamePhase.Start
    ) {
      throw new Error("Extra draw is only allowed in start phase.");
    }

    const player = game.getCurrentPlayer();

    const apBefore = player.board.activeActionPoint;
    const handBefore = player.board.hand.length;
    const deckBefore = player.board.deck.length;

    player.board.payActionPoint(1);
    player.board.draw(1);

    GameLogger.add(game, {
      playerId: player.id,
      type: LogType.Effect,
      message: "エクストラドロー",
      payload: {
        effectType: EffectLogType.ExtraDraw,

        actionSource: source,

        apBefore,
        apAfter: player.board.activeActionPoint,

        handBefore,
        handAfter: player.board.hand.length,

        deckBefore,
        deckAfter: player.board.deck.length,
      },
    });
  }
}