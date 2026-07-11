import { Game } from "../core/Game";
import { Player } from "../core/Player";
import { CardInstance } from "../cards/CardInstance";

export type EffectEvent = {
  attacker?: CardInstance;
  target?: CardInstance;
  selectedTargets?: CardInstance[];
  skipPlayFromHand?: boolean;
  skipSelectableModifyBp?: boolean;
  skipCosts?: boolean;
};

export type EffectContext = {
  game: Game;
  source: CardInstance;
  actor: Player;
  opponent: Player;
  event?: EffectEvent;
};