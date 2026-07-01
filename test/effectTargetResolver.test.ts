import { describe, it, expect } from "vitest";

import { createTestGame } from "./helpers/createTestGame";
import { TestCardFactory } from "./helpers/TestCardFactory";

import { EffectTargetResolver } from "../gameEngine/effects/EffectTargetResolver";
import { Effect } from "../gameEngine/effects/Effect";
import { EffectTrigger } from "../gameEngine/effects/EffectTrigger";

describe("EffectTargetResolver", () => {
  it("own field のキャラ候補を取得できる", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    const saki = TestCardFactory.createCharacter({
      name: "花海 咲季",
    });

    const temari = TestCardFactory.createCharacter({
      name: "月村 手毬",
    });

    const source = TestCardFactory.createCharacter({
      name: "藤田 ことね",
    });

    player.board.frontLine[0].setCard(saki);
    player.board.energyLine[0].setCard(temari);
    const context = {
  game,
  source,
  actor: player,
  opponent: game.getOpponentPlayer(),
};
    const candidates = EffectTargetResolver.resolveCandidates(context, {
      side: "own",
      zone: "field",
      cardType: "character",
    });

    expect(candidates).toContain(saki);
    expect(candidates).toContain(temari);
    expect(candidates).toHaveLength(2);
  });

  it("excludeSelf が true の場合、自身を候補から除外する", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    const source = TestCardFactory.createCharacter({
      name: "藤田 ことね",
    });

    const saki = TestCardFactory.createCharacter({
      name: "花海 咲季",
    });

    player.board.frontLine[0].setCard(source);
    player.board.frontLine[1].setCard(saki);
    const context = {
  game,
  source,
  actor: player,
  opponent: game.getOpponentPlayer(),
};
    const candidates = EffectTargetResolver.resolveCandidates(context, {
      side: "own",
      zone: "field",
      cardType: "character",
      excludeSelf: true,
    });

    expect(candidates).not.toContain(source);
    expect(candidates).toContain(saki);
    expect(candidates).toHaveLength(1);
  });

  it("nameFilter に一致するキャラだけ候補にする", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    const source = TestCardFactory.createCharacter({
      name: "藤田 ことね",
    });

    const saki = TestCardFactory.createCharacter({
      name: "花海 咲季",
    });

    const other = TestCardFactory.createCharacter({
      name: "別キャラ",
    });

    player.board.frontLine[0].setCard(source);
    player.board.frontLine[1].setCard(saki);
    player.board.energyLine[0].setCard(other);
    const context = {
  game,
  source,
  actor: player,
  opponent: game.getOpponentPlayer(),
};
    const candidates = EffectTargetResolver.resolveCandidates(context, {
      side: "own",
      zone: "field",
      cardType: "character",
      nameFilter: ["花海 咲季", "月村 手毬"],
    });

    expect(candidates).toContain(saki);
    expect(candidates).not.toContain(source);
    expect(candidates).not.toContain(other);
    expect(candidates).toHaveLength(1);
  });

  it("条件に一致する候補がない場合は空配列を返す", () => {
    const game = createTestGame();
    const player = game.getCurrentPlayer();

    const source = TestCardFactory.createCharacter({
      name: "藤田 ことね",
    });

    const other = TestCardFactory.createCharacter({
      name: "別キャラ",
    });

    player.board.frontLine[0].setCard(source);
    player.board.energyLine[0].setCard(other);
    const context = {
  game,
  source,
  actor: player,
  opponent: game.getOpponentPlayer(),
};
    const candidates = EffectTargetResolver.resolveCandidates(context, {
      side: "own",
      zone: "field",
      cardType: "character",
      nameFilter: ["花海 咲季", "月村 手毬"],
      excludeSelf: true,
    });

    expect(candidates).toEqual([]);
  });
  it("maxBp判定でContinuousEffectのBP補正を考慮する", () => {
  const game = createTestGame();
  const player = game.getCurrentPlayer();
  const opponent = game.getOpponentPlayer();

  const effect: Effect = {
    id: "continuousBpPlus",
    trigger: EffectTrigger.DuringOwnTurn,
    actions: [
      {
        type: "modifyBpContinuous",
        target: "self",
        amount: 1000,
      },
    ],
  };

  const source = TestCardFactory.createCharacter({
    name: "効果元",
    bp: 1000,
  });

  const target = TestCardFactory.createCharacter({
    name: "対象キャラ",
    bp: 4500,
    effects: [effect],
  });

  opponent.board.frontLine[0].setCard(target);

  const context = {
    game,
    source,
    actor: player,
    opponent,
  };

  const candidates = EffectTargetResolver.resolveCandidates(context, {
    side: "opponent",
    zone: "frontLine",
    cardType: "character",
    maxBp: 5000,
  });

  // 4500 + 1000 = 5500 なので、BP5000以下の候補から外れる
  expect(candidates).not.toContain(target);
  expect(candidates).toHaveLength(0);
});
});