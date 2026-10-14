import { cashCourse } from "../content/cash-course";
import { now, exerciseSchema, type State } from "./domain";
import { addTranscript } from "./pipeline";
export function installCurriculum(s: State) {
  const sourceId = "editorial_cash_v1";
  if (s.videos.some((v) => v.id === sourceId)) return false;
  s.videos.push({
    id: sourceId,
    title: "Guía editorial propia · Cash 6-max NL2 → NL10",
    sourceType: "editorial",
    demo: false,
    relevant: true,
    tags: ["NL2", "NL5", "NL10"],
    status: "published",
    createdAt: now(),
  });
  for (const [i, u] of cashCourse.entries()) {
    const id = `core_${String(i + 1).padStart(2, "0")}_${u.slug}`;
    const body = `Material editorial propio. No procede del canal ni es una solución de solver.\n\n${u.theory}\n\nProceso de decisión\n\n${u.method.map((v, n) => `${n + 1}. ${v}`).join("\n\n")}\n\nCondiciones y límites\n\n${u.limits}\n\nAplicación fuera de sesión\n\n${u.practice}\n\nAutoevaluación\n\n${u.questions.map((q) => q.prompt).join("\n\n")}`;
    const t = addTranscript(s, sourceId, body, `${id}.txt`);
    const segments = s.segments.filter((g) => g.transcriptId === t.id);
    const cId = `concept_${id}`;
    s.concepts.push({
      id: cId,
      videoId: sourceId,
      title: u.title,
      explanation: body,
      quote: u.theory,
      segmentIds: segments.map((g) => g.id),
      kind: "extracto",
      conditions: [u.limits],
      warnings: [
        "Guía editorial propia, no atribuida al canal.",
        "Heurísticas cualitativas; sin cálculo de EV ni validación de solver.",
      ],
      topic: u.area,
      version: "editorial-v1",
      createdAt: now(),
    });
    s.lessons.push({
      id,
      videoId: sourceId,
      title: u.title,
      module: `${String(i + 1).padStart(2, "0")} · ${u.area}`,
      level:
        i < 12
          ? "Intermedio · NL2 / NL5"
          : "Intermedio · Consolidar NL5 / preparar NL10",
      body,
      objectives: [u.objective],
      prerequisites: i
        ? [cashCourse[i - 1].title]
        : ["Conocimiento previo de reglas y posiciones de cash Hold’em."],
      conceptIds: [cId],
      segmentIds: segments.map((g) => g.id),
      status: "published",
      confidence: "Guía editorial propia · heurísticas revisables",
      version: 1,
      demo: false,
    });
    for (const [n, q] of u.questions.entries()) {
      const options = [...q.options];
      const offset = (i + n) % options.length;
      const rotated = options.map(
        (_, k) => options[(k + offset) % options.length],
      );
      const accepted = q.accepted.map(
        (k) => (k - offset + options.length) % options.length,
      );
      s.exercises.push(
        exerciseSchema.parse({
          id: `exercise_${id}_${n}`,
          lessonId: id,
          prompt: q.prompt,
          options: rotated,
          accepted,
          explanation: q.explanation,
          assumptions: [
            u.limits,
            "Ejercicio editorial: las situaciones hipotéticas no describen estadísticas reales de un rival.",
            "Puede haber varias respuestas defendibles bajo supuestos distintos.",
          ],
          segmentIds: segments.map((g) => g.id),
          difficulty: i > 11 ? "avanzado" : "intermedio",
          kind: "heurística",
          demo: false,
        }),
      );
    }
    const cardId = `card_${id}`;
    s.cards.push({
      id: cardId,
      lessonId: id,
      front: `${u.objective} ¿Qué proceso y qué límites aplicarías?`,
      back: `${u.method.join("\n\n")}\n\n${u.limits}`,
      segmentIds: segments.map((g) => g.id),
      demo: false,
    });
    s.reviews.push({
      id: `review_${cardId}`,
      cardId,
      ease: 2.5,
      interval: 0,
      repetitions: 0,
      due: now(),
      history: [],
    });
  }
  s.videos.find((v) => v.id === sourceId)!.status = "published";
  return true;
}
