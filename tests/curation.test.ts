import { it, expect } from "vitest";
import { emptyState, now } from "../src/lib/domain";
import { addTranscript } from "../src/lib/pipeline";
import { curateSource } from "../src/lib/curation";
import { sourceNoteSchema } from "../src/lib/curation";
import { reviewClasses, reviewedSessions } from "../src/content/review-classes";
it("las clases de revisiones tienen intervalos reales acotados y preguntas conceptuales válidas", () => {
  expect(reviewClasses).toHaveLength(12);
  for (const lesson of reviewClasses) {
    expect(sourceNoteSchema.safeParse(lesson).success).toBe(true);
    const session = reviewedSessions.find((s) => s.id === lesson.videoId)!;
    expect(lesson.to).toBeLessThanOrEqual(session.duration);
    expect(lesson.to).toBeGreaterThan(lesson.from);
    expect(lesson.teaching.example).toContain("hipotético");
    for (const question of lesson.questions)
      expect(
        question.accepted.every((i) => i >= 0 && i < question.options.length),
      ).toBe(true);
  }
});
it("rechaza notas sin transcripción y conserva referencias exactas al curar", () => {
  const s = emptyState();
  s.videos.push({
    id: "v",
    youtubeId: "abcdefghijk",
    title: "Fuente de prueba",
    demo: false,
    relevant: true,
    tags: [],
    status: "transcript_missing",
    createdAt: now(),
  });
  const note = {
    slug: "prueba",
    videoId: "abcdefghijk",
    title: "Interpretación de prueba",
    module: "Rangos",
    from: 5,
    to: 15,
    summary:
      "Una síntesis de prueba suficientemente extensa que mantiene los límites del material original y no se presenta como una solución de solver.",
    limits: "Faltan cartas y tamaños.",
    questions: [
      {
        prompt: "¿Qué datos hacen falta para concretar?",
        options: ["Cartas y tamaños.", "Solo el resultado."],
        accepted: [0],
        explanation:
          "Para reconstruir el spot hacen falta datos que la síntesis no proporciona.",
      },
    ],
  };
  expect(() => curateSource(s, note)).toThrow("transcripción");
  addTranscript(
    s,
    "v",
    "YouTube transcript\nVideo ID: abcdefghijk\nLanguage: es\nCaptions: auto-generated\n\n[0:05] El rango y la posición condicionan esta decisión.\n[0:10] Faltan cartas y tamaños para concretar.\n[0:15] Conviene contrastar el contexto de la fuente.",
    "source.txt",
  );
  expect(curateSource(s, note)).toBe(true);
  expect(curateSource(s, note)).toBe(false);
  const lesson = s.lessons[0];
  const segment = s.segments.find((g) => g.id === lesson.segmentIds[0])!;
  expect(segment.start).toBe(5);
  expect(segment.end).toBe(15);
  expect(segment.text).toContain(s.concepts[0].quote);
  expect(s.exercises[0].kind).toBe("pendiente");
});
