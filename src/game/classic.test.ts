import { describe, expect, it } from "vitest";
import {
  classicReducer,
  initialClassicState,
  MAX_LIVES,
  METER_SIZE,
  pointsFor,
  remainingCrownCategories,
  type ClassicState,
} from "./classic";
import type { CategoryId, Question } from "./types";

function q(category: CategoryId = "capitais"): Question {
  return { id: `t:${category}`, category, prompt: "?", options: ["a", "b", "c", "d"], answerIndex: 2 };
}

function play(state: ClassicState, correct: boolean, isCrown = false, category: CategoryId = "capitais") {
  let s = classicReducer(state, { type: "start-question", question: q(category), isCrown });
  s = classicReducer(s, { type: "answer", chosenIndex: correct ? 2 : 0, timeLeftSec: 10 });
  return classicReducer(s, { type: "next" });
}

describe("modo clássico", () => {
  it("acerto soma pontos com bônus de tempo e avança o medidor", () => {
    const s = play(initialClassicState, true);
    expect(s.score).toBe(pointsFor(10, false));
    expect(s.meter).toBe(1);
    expect(s.phase).toBe("spin");
  });

  it("medidor cheio leva à escolha de coroa", () => {
    let s = initialClassicState;
    for (let i = 0; i < METER_SIZE; i++) s = play(s, true);
    expect(s.phase).toBe("crown-pick");
  });

  it("acertar pergunta de coroa ganha a coroa e zera o medidor; errar só zera", () => {
    const won = play({ ...initialClassicState, meter: METER_SIZE, phase: "crown-pick" }, true, true, "moedas");
    expect(won.crowns).toEqual(["moedas"]);
    expect(won.meter).toBe(0);

    const lost = play({ ...initialClassicState, meter: METER_SIZE, phase: "crown-pick" }, false, true, "moedas");
    expect(lost.crowns).toEqual([]);
    expect(lost.meter).toBe(0);
    expect(lost.lives).toBe(MAX_LIVES - 1);
  });

  it("tempo esgotado conta como erro", () => {
    let s = classicReducer(initialClassicState, { type: "start-question", question: q(), isCrown: false });
    s = classicReducer(s, { type: "answer", chosenIndex: null, timeLeftSec: 0 });
    expect(s.lives).toBe(MAX_LIVES - 1);
    expect(s.history[0]?.correct).toBe(false);
  });

  it("perde ao zerar vidas e vence com as 6 coroas", () => {
    let s = initialClassicState;
    for (let i = 0; i < MAX_LIVES; i++) s = play(s, false);
    expect(s.phase).toBe("lost");

    const almost: ClassicState = {
      ...initialClassicState,
      phase: "crown-pick",
      crowns: ["capitais", "bandeiras", "continentes", "moedas", "idiomas"],
    };
    expect(remainingCrownCategories(almost.crowns)).toEqual(["natureza"]);
    expect(play(almost, true, true, "natureza").phase).toBe("won");
  });

  it("ignora ações fora de fase (ex.: duplo clique em resposta)", () => {
    let s = classicReducer(initialClassicState, { type: "start-question", question: q(), isCrown: false });
    s = classicReducer(s, { type: "answer", chosenIndex: 2, timeLeftSec: 5 });
    const again = classicReducer(s, { type: "answer", chosenIndex: 0, timeLeftSec: 5 });
    expect(again).toBe(s);
  });
});
