import { Game } from "./Game";
import { Player } from "./Player";
import { Board } from "./Board";
import { CardInstance } from "../cards/CardInstance";

export class GameCloner {
  public static clone(game: Game): Game {
    const cardMap = new Map<CardInstance, CardInstance>();

    const player1 = this.clonePlayer(game.player1, cardMap);
    const player2 = this.clonePlayer(game.player2, cardMap);

    const clonedGame = new Game(player1, player2);

    clonedGame.currentPlayerId = game.currentPlayerId;
    clonedGame.phase = game.phase;
    clonedGame.winner = game.winner;
    clonedGame.turnCount = game.turnCount;
    clonedGame.firstPlayerId = game.firstPlayerId;
    clonedGame.nextLogId = game.nextLogId;

    clonedGame.playerTurnCounts = {
      ...game.playerTurnCounts,
    };

    clonedGame.logs = game.logs.map((log) => ({
      ...log,
      payload: log.payload ? { ...log.payload } : log.payload,
    }));

    clonedGame.pendingRaidTrigger = game.pendingRaidTrigger
      ? {
          revealedCard: this.cloneCardInstance(
            game.pendingRaidTrigger.revealedCard,
            cardMap
          ),
          playerId: game.pendingRaidTrigger.playerId,
          opponentPlayerId: game.pendingRaidTrigger.opponentPlayerId,
        }
      : undefined;

    clonedGame.pendingTriggerChoice = game.pendingTriggerChoice
      ? {
          revealedCard: this.cloneCardInstance(
            game.pendingTriggerChoice.revealedCard,
            cardMap
          ),
          playerId: game.pendingTriggerChoice.playerId,
          opponentPlayerId: game.pendingTriggerChoice.opponentPlayerId,
          triggerType: game.pendingTriggerChoice.triggerType,
        }
      : undefined;

    return clonedGame;
  }

  private static clonePlayer(
    player: Player,
    cardMap: Map<CardInstance, CardInstance>
  ): Player {
    return new Player(
      player.id,
      player.name,
      this.cloneBoard(player.board, cardMap)
    );
  }

  private static cloneBoard(
    board: Board,
    cardMap: Map<CardInstance, CardInstance>
  ): Board {
    const clonedBoard = new Board();

    clonedBoard.hand = board.hand.map((card) =>
      this.cloneCardInstance(card, cardMap)
    );

    clonedBoard.deck = board.deck.map((card) =>
      this.cloneCardInstance(card, cardMap)
    );

    clonedBoard.lifeArea.push(
      ...board.lifeArea.map((card) => this.cloneCardInstance(card, cardMap))
    );

    clonedBoard.actionPoints.push(
      ...board.actionPoints.map((card) =>
        this.cloneCardInstance(card, cardMap)
      )
    );

    clonedBoard.trash.push(
      ...board.trash.map((card) => this.cloneCardInstance(card, cardMap))
    );

    clonedBoard.removeArea.push(
      ...board.removeArea.map((card) => this.cloneCardInstance(card, cardMap))
    );

    for (let i = 0; i < board.frontLine.length; i++) {
      const originalCard = board.frontLine[i].getCard();

      if (originalCard) {
        this.putCardToSlot(
          clonedBoard.frontLine[i],
          this.cloneCardInstance(originalCard, cardMap)
        );
      }
    }

    for (let i = 0; i < board.energyLine.length; i++) {
      const originalCard = board.energyLine[i].getCard();

      if (originalCard) {
        this.putCardToSlot(
          clonedBoard.energyLine[i],
          this.cloneCardInstance(originalCard, cardMap)
        );
      }
    }

    clonedBoard.maxActionPoint = board.maxActionPoint;
    clonedBoard.activeActionPoint = board.activeActionPoint;
    clonedBoard.hasUsedExtraDrawThisTurn = board.hasUsedExtraDrawThisTurn;

    clonedBoard.usedCardNameEffectIdsThisTurn = new Set(
      board.usedCardNameEffectIdsThisTurn
    );

    return clonedBoard;
  }

  private static cloneCardInstance(
    cardInstance: CardInstance,
    cardMap: Map<CardInstance, CardInstance>
  ): CardInstance {
    const existing = cardMap.get(cardInstance);

    if (existing) {
      return existing;
    }

    const cloned = new CardInstance(
      cardInstance.instanceId,
      cardInstance.card,
      cardInstance.isRest,
      cardInstance.temporaryBpBonus
    );

    cardMap.set(cardInstance, cloned);

    cloned.usedEffectIdsThisTurn = new Set(cardInstance.usedEffectIdsThisTurn);
    cloned.cannotBeBlockedByMinBp = cardInstance.cannotBeBlockedByMinBp;
    cloned.attackedThisTurnCount = cardInstance.attackedThisTurnCount;
    cloned.blockedThisTurnCount = cardInstance.blockedThisTurnCount;

    if (cardInstance.raidBase) {
      cloned.raidBase = this.cloneCardInstance(cardInstance.raidBase, cardMap);
    }

    return cloned;
  }

  private static putCardToSlot(slot: unknown, card: CardInstance): void {
    const mutableSlot = slot as {
      setCard?: (card: CardInstance) => void;
      placeCard?: (card: CardInstance) => void;
      putCard?: (card: CardInstance) => void;
      card?: CardInstance;
    };

    if (typeof mutableSlot.setCard === "function") {
      mutableSlot.setCard(card);
      return;
    }

    if (typeof mutableSlot.placeCard === "function") {
      mutableSlot.placeCard(card);
      return;
    }

    if (typeof mutableSlot.putCard === "function") {
      mutableSlot.putCard(card);
      return;
    }

    mutableSlot.card = card;
  }
}