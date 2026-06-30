import { Game } from "../../core/Game";
import { CardInstance } from "../../cards/CardInstance";
import { EffectAction } from "../EffectAction";

type DrawAction = Extract<EffectAction, { type: "draw" }>;

export class DrawEffectAction {
  public static execute(
    game: Game,
    _source: CardInstance,
    action: DrawAction
  ): void {
    game.getCurrentPlayer().board.draw(action.count);
  }
}