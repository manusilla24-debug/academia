import type { Lesson, State } from "./domain";

export const learningPaths = [
  {
    id: "strategy",
    number: "01",
    title: "La estrategia de la academia",
    description:
      "Valor, faroles y calls con un motivo. Tu punto de partida para NL2.",
    match: (l: Lesson) => l.module.includes("Nuestra estrategia"),
  },
  {
    id: "preflop",
    number: "02",
    title: "Construye el bote desde preflop",
    description: "Selección de manos, defensa de ciegas y botes 3-beteados.",
    match: (l: Lesson) => /preflop|ciega|3-bet|3-betead/i.test(l.module),
  },
  {
    id: "postflop",
    number: "03",
    title: "Piensa en rangos, calle a calle",
    description:
      "Flop, turn y river: entiende qué cambia antes de volver a apostar.",
    match: (l: Lesson) => /single|turn|river|valor|bluff/i.test(l.module),
  },
  {
    id: "lab",
    number: "04",
    title: "Aprende revisando manos",
    description:
      "Lectura de rangos, perfiles, leaks y transferencia a tu propio juego.",
    match: () => true,
  },
] as const;

export function pathFor(l: Lesson) {
  return learningPaths.find((p) => p.match(l))!;
}
export function readingMinutes(l: Lesson) {
  return Math.max(1, Math.ceil(l.body.split(/\s+/).length / 180));
}
export function compareLessons(a: Lesson, b: Lesson) {
  const first = [
    "academy_estrategia-academia",
    "academy_no-bluffcatch-nl2",
    "academy_valor-nl2",
    "academy_farol-con-plan",
  ];
  const priority = (l: Lesson) =>
    first.includes(l.id)
      ? first.indexOf(l.id) - 10
      : learningPaths.indexOf(pathFor(l));
  return (
    priority(a) - priority(b) ||
    a.id.localeCompare(b.id, "es", { numeric: true })
  );
}
export function orderedLessons(s: Pick<State, "lessons">) {
  return s.lessons
    .filter((l) => !l.demo && l.status === "published")
    .sort(compareLessons);
}

export function nextLesson(s: Pick<State, "lessons" | "progress">) {
  const lessons = orderedLessons(s);
  const recent = [...s.progress]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .find((p) => !p.completed && lessons.some((l) => l.id === p.lessonId));
  return (
    lessons.find((l) => l.id === recent?.lessonId) ??
    lessons.find(
      (l) => !s.progress.some((p) => p.lessonId === l.id && p.completed),
    ) ??
    lessons[0]
  );
}
