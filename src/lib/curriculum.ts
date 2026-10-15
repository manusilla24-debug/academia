import { cashCourse } from "../content/cash-course";
import { academyCourse, workedExamples } from "../content/academy-course";
import { now, exerciseSchema, type State } from "./domain";
import { addTranscript } from "./pipeline";
export function installCurriculum(s: State) {
  const sourceId = "editorial_cash_v1";
  let changed = false;
  if (!s.videos.some((v) => v.id === sourceId))
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
  for (const [i, u] of [...cashCourse, ...academyCourse].entries()) {
    const id =
      i < cashCourse.length
        ? `core_${String(i + 1).padStart(2, "0")}_${u.slug}`
        : `academy_${u.slug}`;
    const oldBody = `Material editorial propio. No procede del canal ni es una solución de solver.\n\n${u.theory}\n\nProceso de decisión\n\n${u.method.map((v, n) => `${n + 1}. ${v}`).join("\n\n")}\n\nCondiciones y límites\n\n${u.limits}\n\nAplicación fuera de sesión\n\n${u.practice}\n\nAutoevaluación\n\n${u.questions.map((q) => q.prompt).join("\n\n")}`;
    const body = `En esta clase aprenderemos\n\n${u.objective}\n\nLa idea que necesitas entender\n\n${u.theory}${workedExamples[u.slug] ? `\n\nUn ejemplo razonado\n\nEjemplo hipotético de estudio.\n\n${workedExamples[u.slug]}` : ""}\n\nCómo tomar la decisión\n\n${u.method.map((v, n) => `${n + 1}. ${v}`).join("\n\n")}\n\nEl error que queremos evitar\n\n${u.limits}\n\nTu tarea de hoy\n\n${u.practice}\n\nComprueba si lo has entendido\n\n${u.questions.map((q) => q.prompt).join("\n\n")}`;
    const existing = s.lessons.find((l) => l.id === id);
    if (existing) {
      if (
        i >= cashCourse.length &&
        existing.version === 2 &&
        existing.body === body &&
        !existing.revisions?.length &&
        (existing.module !== u.area ||
          existing.level !== "Fundamentos · NL2 / NL5")
      ) {
        existing.module = u.area;
        existing.level = "Fundamentos · NL2 / NL5";
        changed = true;
      }
      // Only replace the exact shipped v1 text. Personal edits and progress survive.
      if (
        existing.version === 1 &&
        existing.body === oldBody &&
        !existing.revisions?.length
      ) {
        existing.revisions = [
          { version: 1, title: existing.title, body: existing.body, at: now() },
        ];
        existing.body = body;
        existing.version = 2;
        changed = true;
      }
      continue;
    }
    changed = true;
    const t = addTranscript(s, sourceId, body, `${id}.txt`);
    const segments = s.segments.filter((g) => g.transcriptId === t.id);
    const cId = `concept_${id}`;
    s.concepts.push({
      id: cId,
      videoId: sourceId,
      title: u.title,
      explanation: body,
      quote: u.theory.split(/\n\n/)[0],
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
      module:
        i >= cashCourse.length
          ? u.area
          : `${String(i + 1).padStart(2, "0")} · ${u.area}`,
      level:
        i >= cashCourse.length
          ? "Fundamentos · NL2 / NL5"
          : i < 12
            ? "Intermedio · NL2 / NL5"
            : "Intermedio · Consolidar NL5 / preparar NL10",
      body,
      objectives: [u.objective],
      prerequisites:
        i && i < cashCourse.length
          ? [cashCourse[i - 1].title]
          : ["Conocimiento previo de reglas y posiciones de cash Hold’em."],
      conceptIds: [cId],
      segmentIds: segments.map((g) => g.id),
      status: "published",
      confidence: "Guía editorial propia · heurísticas revisables",
      version: 2,
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
  return changed;
}
