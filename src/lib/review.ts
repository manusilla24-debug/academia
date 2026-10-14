import type { Review } from "./domain";
export function schedule(
  previous: Review,
  grade: number,
  date = new Date(),
): Review {
  if (!Number.isInteger(grade) || grade < 0 || grade > 5)
    throw new Error("Nota SM-2 inválida.");
  let { ease, interval, repetitions } = previous;
  ease = Math.max(1.3, ease + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (grade < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    interval =
      repetitions === 0
        ? 1
        : repetitions === 1
          ? 6
          : Math.round(interval * ease);
    repetitions++;
  }
  return {
    ...previous,
    ease,
    interval,
    repetitions,
    due: new Date(date.getTime() + interval * 86400000).toISOString(),
    lastGrade: grade,
    history: [...previous.history, { at: date.toISOString(), grade }],
  };
}
