import { z } from "zod";
import { now, exerciseSchema, type State } from "./domain";
import { hash } from "./transcripts";
import { sourceClasses } from "../content/source-classes";
import shippedNotes from "../content/channel-notes.json";
export const sourceNoteSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  videoId: z.string(),
  title: z.string(),
  module: z.string(),
  from: z.number().nonnegative(),
  to: z.number().positive(),
  summary: z.string().min(100),
  limits: z.string(),
  teaching: z
    .object({
      title: z.string(),
      objective: z.string(),
      explanation: z.string(),
      example: z.string(),
      method: z.array(z.string()),
      practice: z.string(),
    })
    .optional(),
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
  const shippedSource = shippedNotes.some(
    (n) =>
      n.slug === note.slug &&
      n.videoId === note.videoId &&
      n.from === note.from &&
      n.to === note.to,
  );
  const teaching =
    note.teaching ?? (shippedSource ? sourceClasses[note.slug] : undefined);
  const title = teaching?.title ?? note.title;
  const objective = teaching?.objective ?? note.title;
  const body = `En esta clase aprenderemos\n\n${objective}\n\nLa idea que necesitas entender\n\n${teaching?.explanation ?? note.summary}${teaching ? `\n\nUn ejemplo razonado\n\n${teaching.example}\n\nCómo tomar la decisión\n\n${teaching.method.map((m, i) => `${i + 1}. ${m}`).join("\n\n")}` : ""}\n\nTu tarea de hoy\n\n${teaching?.practice ?? "Elige una mano propia relacionada. Oculta el resultado y escribe el rango rival, el objetivo de tu acción y una alternativa. Después compara tu razonamiento con la clase y con la fuente original."}\n\nCondiciones de esta idea\n\n${note.limits}`;
  const existing = s.lessons.find((l) => l.id === id);
  if (existing) {
    const legacyBody = `Síntesis editorial del fragmento original\n\n${note.summary}\n\nCondiciones y datos ausentes\n\n${note.limits}\n\nCómo estudiar este fragmento\n\nExplica la idea con tus palabras, compara el fragmento original y registra qué supuestos cambiarían tu decisión. El texto automático no permite reconstruir con seguridad todos los naipes, tamaños o datos que aparecen en pantalla. Las afirmaciones generales deben contrastarse con el contexto del audio.\n\nAplicación fuera de sesión\n\nSelecciona una mano propia relacionada, oculta el resultado y anota rango rival, objetivo de la acción y una alternativa. Estas preguntas son una elaboración de estudio, no una cita del profesor.`;
    if (
      existing.version !== 1 ||
      existing.body !== legacyBody ||
      existing.revisions?.length
    )
      return false;
    existing.revisions = [
      {
        version: existing.version,
        title: existing.title,
        body: existing.body,
        at: now(),
      },
    ];
    existing.title = title;
    existing.body = body;
    existing.objectives = [
      objective,
      "Aplicar el criterio a una mano propia y explicar una alternativa.",
    ];
    existing.version = 2;
    const card = s.cards.find((c) => c.id === `card_${id}`);
    if (
      card &&
      card.front ===
        `Explica «${note.title}» e indica qué datos no permite reconstruir la fuente.`
    ) {
      card.front = `Explica «${title}». ¿Cuándo lo aplicarías y qué cambiaría tu decisión?`;
      card.back = `${teaching?.explanation ?? note.summary}\n\n${note.limits}`;
    }
    return true;
  }
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
    title,
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
  s.lessons.push({
    id,
    videoId: video.id,
    title,
    module: note.module,
    level: "Intermedio · NL2 / NL5 / preparación NL10",
    body,
    objectives: [
      objective,
      "Aplicar el criterio a una mano propia y explicar una alternativa.",
    ],
    prerequisites: ["Cash Hold’em, posiciones y lectura básica de rangos."],
    conceptIds: [cId],
    segmentIds: [segmentId],
    status: "published",
    confidence: "Síntesis contrastada con ASR · verificar audio para precisión",
    version: 2,
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
          teaching
            ? "Ejercicio conceptual editorial; no reconstruye una mano con cartas ausentes."
            : "Ejercicio editorial derivado del fragmento; pendiente de revisión personal.",
        ],
        segmentIds: [segmentId],
        difficulty: "intermedio",
        kind: teaching ? "heurística" : "pendiente",
        demo: false,
      }),
    );
  const cardId = `card_${id}`;
  s.cards.push({
    id: cardId,
    lessonId: id,
    front: `Explica «${title}». ¿Cuándo lo aplicarías y qué cambiaría tu decisión?`,
    back: `${teaching?.explanation ?? note.summary}\n\n${note.limits}`,
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
