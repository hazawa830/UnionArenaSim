import { Game } from "../core/Game";
import { GamePhase } from "../enum/GamePhase";
import { BoardLine } from "../enum/BoardLine";
import { PlayCardAction } from "../actions/PlayCardAction";
import { AttackAction } from "../actions/AttackAction";
import { CardType } from "../enum/CardType";
export class RandomCPU {
  public static playPhase(game: Game): void {
    if (game.winner) {
        return;
    }
    switch (game.phase) {
      case GamePhase.Start:
        game.nextPhase();
        break;

      case GamePhase.Move:
        // 最初は移動しない
        game.nextPhase();
        break;

      case GamePhase.Main:
        this.playCardsUntilCannot(game);
        game.nextPhase();
        break;

      case GamePhase.Attack:
        this.attackWithAllActiveCards(game);
        game.nextPhase();
        break;

      case GamePhase.End:
        game.nextPhase();
        break;
    }
  }
    
  private static playRandomCard(game: Game): boolean {
    const player = game.getCurrentPlayer();
    const destination = this.chooseDestination(game);

    if (!destination) {
      return false;
    }

    const playableIndexes = this.getPlayableHandIndexes(game, destination);

    if (playableIndexes.length === 0) {
      return false;;
    }

    const randomIndex =
      playableIndexes[Math.floor(Math.random() * playableIndexes.length)];

    PlayCardAction.execute(game, randomIndex, destination);
    return true;
  }
  private static playCardsUntilCannot(game: Game): void {
    let guard = 0;

    while (guard < 10) {
        const played = this.playRandomCard(game);

        if (!played) {
        return;
        }

        guard++;
    }
  }
  private static chooseDestination(game: Game): BoardLine | undefined {
    const board = game.getCurrentPlayer().board;

    const hasEnergyCard = board.energyLine.some((slot) => !slot.isEmpty());
    const hasEmptyFrontSlot = board.getEmptyFrontSlot() !== undefined;
    const hasEmptyEnergySlot = board.getEmptyEnergySlot() !== undefined;

    if (!hasEnergyCard && hasEmptyEnergySlot) {
      return BoardLine.EnergyLine;
    }

    if (hasEnergyCard && hasEmptyFrontSlot) {
      return BoardLine.FrontLine;
    }

    if (hasEmptyEnergySlot) {
      return BoardLine.EnergyLine;
    }

    return undefined;
  }

  private static getPlayableHandIndexes(
    game: Game,
    destination: BoardLine
  ): number[] {
    const player = game.getCurrentPlayer();
    const board = player.board;
    const playableIndexes: number[] = [];

    for (let i = 0; i < board.hand.length; i++) {
      const card = board.hand[i];

      if (!card) {
        continue;
      }

      const canPayEnergy = board
        .getGeneratedEnergy()
        .canPay(card.card.requiredEnergy);

      const canPayAp = board.activeActionPoint >= card.card.actionPointCost;

      const hasEmptySlot =
        destination === BoardLine.FrontLine
          ? board.getEmptyFrontSlot() !== undefined
          : board.getEmptyEnergySlot() !== undefined;

      if (canPayEnergy && canPayAp && hasEmptySlot) {
        playableIndexes.push(i);
      }
    }

    return playableIndexes;
  }

  private static attackWithAllActiveCards(game: Game): void {
    const player = game.getCurrentPlayer();
    
    for (let i = 0; i < player.board.frontLine.length; i++) {
        
        if (game.winner) {
        return;
        }

        const card = player.board.frontLine[i].getCard();

        if (!card) {
        continue;
        }

        if (card.isRest) {
        continue;
        }

        AttackAction.execute(game, i);
    }
  }
    public static chooseBlockerIndex(game: Game): number | undefined {
    const blockerPlayer = game.getOpponentPlayer();

    const blockableIndexes: number[] = [];

    for (let i = 0; i < blockerPlayer.board.frontLine.length; i++) {
        const card = blockerPlayer.board.frontLine[i].getCard();

        if (!card) {
        continue;
        }

        if (card.isRest) {
        continue;
        }

        if (card.card.cardType !== CardType.Character) {
        continue;
        }

        blockableIndexes.push(i);
    }

    if (blockableIndexes.length === 0) {
        return undefined;
    }

    const shouldBlock = Math.random() < 0.5;

    if (!shouldBlock) {
        return undefined;
    }

    return blockableIndexes[
        Math.floor(Math.random() * blockableIndexes.length)
    ];
    }
}