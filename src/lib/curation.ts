import { z } from "zod";
import { now, exerciseSchema, type State } from "./domain";
import { hash } from "./transcripts";
export const sourceNoteSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  videoId: z.string(),
  title: z.string(),
  module: z.string(),
  from: z.number().nonnegative(),
  to: z.number().positive(),
  summary: z.string().min(100),
  limits: z.string(),
  questions: z
    .array(
      z.object({
        prompt: z.string(),
        options: z.array(z.string()).min(2),
        accepted: z.array(z.number().int().nonnegative()),
        explanation: z.string(),
      }),
    )
    .min(1),
});
export function curateSource(s: State, input: unknown) {
  const note = sourceNoteSchema.parse(input);
  const video = s.videos.find((v) => v.youtubeId === note.videoId);
  if (!video) throw new Error("Importa primero el vídeo real.");
  const transcript = s.transcripts.filter((t) => t.videoId === video.id).at(-1);
  if (!transcript)
    throw new Error(
      "No hay transcripción disponible: no se puede atribuir esta lección al vídeo.",
    );
  const cues = transcript.cues.filter(
    (c) => c.start !== undefined && c.start >= note.from && c.start <= note.to,
  );
  if (cues.length < 3)
    throw new Error("El intervalo no tiene suficientes cues de fuente.");
  const text = cues.map((c) => c.text).join(" ");
  const id = `channel_${note.slug}`;
  if (s.lessons.some((l) => l.id === id)) return false;
  const segmentId = `curated_${hash(`${transcript.id}:${note.from}:${note.to}`).slice(0, 24)}`;
  if (!s.segments.some((g) => g.id === segmentId))
    s.segments.push({
      id: segmentId,
      transcriptId: transcript.id,
      videoId: video.id,
      text,
      hash: hash(text),
      start: cues[0].start,
      end: cues.at(-1)?.start,
      ordinal: s.segments.filter((g) => g.transcriptId === transcript.id)
        .length,
    });
  const cId = `concept_${id}`;
  s.concepts.push({
    id: cId,
    videoId: video.id,
    title: note.title,
    explanation: note.summary,
    quote: (cues.find((c) => c.text.length > 20) ?? cues[0]).text,
    segmentIds: [segmentId],
    kind: "interpretación IA",
    conditions: [note.limits],
    warnings: [
      "Síntesis editorial a partir de subtítulos automáticos.",
      "No es la voz literal del profesor ni una salida de solver.",
    ],
    topic: note.module,
    version: "source-notes-v1",
    createdAt: now(),
  });
  const body = `Síntesis editorial del fragmento original\n\n${note.summary}\n\nCondiciones y datos ausentes\n\n${note.limits}\n\nCómo estudiar este fragmento\n\nExplica la idea con tus palabras, compara el fragmento original y registra qué supuestos cambiarían tu decisión. El texto automático no permite reconstruir con seguridad todos los naipes, tamaños o datos que aparecen en pantalla. Las afirmaciones generales deben contrastarse con el contexto del audio.\n\nAplicación fuera de sesión\n\nSelecciona una mano propia relacionada, oculta el resultado y anota rango rival, objetivo de la acción y una alternativa. Estas preguntas son una elaboración de estudio, no una cita del profesor.`;
  s.lessons.push({
    id,
    videoId: video.id,
    title: note.title,
    module: note.module,
    level: "Intermedio · NL2 / NL5 / preparación NL10",
    body,
    objectives: [
      "Explicar el concepto manteniendo sus condiciones.",
      "Distinguir la fuente de la interpretación editorial.",
    ],
    prerequisites: ["Cash Hold’em, posiciones y lectura básica de rangos."],
    conceptIds: [cId],
    segmentIds: [segmentId],
    status: "published",
    confidence: "Síntesis contrastada con ASR · verificar audio para precisión",
    version: 1,
    demo: false,
  });
  for (const [i, q] of note.questions.entries())
    s.exercises.push(
      exerciseSchema.parse({
        id: `exercise_${id}_${i}`,
        lessonId: id,
        prompt: q.prompt,
        options: q.options,
        accepted: q.accepted,
        explanation: q.explanation,
        assumptions: [
          note.limits,
          "Ejercicio editorial derivado del fragmento; pendiente de revisión personal.",
        ],
        segmentIds: [segmentId],
        difficulty: "intermedio",
        kind: "pendiente",
        demo: false,
      }),
    );
  const cardId = `card_${id}`;
  s.cards.push({
    id: cardId,
    lessonId: id,
    front: `Explica «${note.title}» e indica qué datos no permite reconstruir la fuente.`,
    back: `${note.summary}\n\n${note.limits}`,
    segmentIds: [segmentId],
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
  video.status = "published";
  return true;
}
