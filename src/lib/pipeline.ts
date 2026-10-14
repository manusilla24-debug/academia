import { randomUUID } from "node:crypto";
import { mutate, readState } from "./db/store";
import {
  now,
  type Job,
  type State,
  type Transcript,
  exerciseSchema,
} from "./domain";
import {
  hash,
  FileTranscriptProvider,
  segmentTranscript,
  classify,
} from "./transcripts";
import {
  ExtractiveProvider,
  OpenAICompatibleProvider,
  estimatedCost,
  cost,
  verifyExtraction,
  type KnowledgeProvider,
} from "./ai";
export function addTranscript(
  s: State,
  videoId: string,
  raw: string,
  name: string,
) {
  const video = s.videos.find((v) => v.id === videoId);
  if (!video) throw new Error("Vídeo no encontrado.");
  if (
    s.jobs.some(
      (j) =>
        j.videoId === videoId &&
        !!j.leaseOwner &&
        Date.parse(j.leaseUntil ?? "") > Date.now(),
    )
  )
    throw new Error(
      "Pausa el trabajo y espera al worker antes de sustituir su fuente.",
    );
  const { cues, format } = new FileTranscriptProvider().parse(raw, name);
  const digest = hash(JSON.stringify(cues));
  const existing = s.transcripts.find(
    (t) => t.videoId === videoId && t.hash === digest,
  );
  if (existing) return existing;
  const text = cues.map((c) => c.text).join("\n");
  const spanish =
    /\b(el|la|los|las|que|una|para|por|con|rango|bote|mano)\b/i.test(text);
  const t: Transcript = {
    id: randomUUID(),
    videoId,
    name,
    format,
    hash: digest,
    cues,
    text,
    createdAt: now(),
    quality: /Captions: auto-generated/.test(raw)
      ? "Subtítulos automáticos: revisar cartas, sizings, nombres y negaciones."
      : text.length < 300
        ? "Breve: revisa cobertura."
        : "Pendiente de revisión de calidad.",
    language: spanish ? "es probable" : "no determinado",
  };
  s.transcripts.push(t);
  s.segments.push(...segmentTranscript(t));
  video.status = "transcript_ready";
  video.error = undefined;
  const c = classify(`${video.title} ${text.slice(0, 10000)}`);
  if (!c.relevant) video.relevant = false;
  video.tags = [...new Set([...video.tags, ...c.tags])];
  for (const job of s.jobs.filter(
    (j) => j.videoId === videoId && j.status !== "completed",
  ))
    job.status = "paused";
  return t;
}
export function queueJob(
  s: State,
  videoId: string,
  provider: "extractive" | "ai",
  budget: number,
  confirmed: boolean,
) {
  if (s.settings.stopJobs)
    throw new Error("Los nuevos trabajos están detenidos en Ajustes.");
  const video = s.videos.find((v) => v.id === videoId);
  if (!video) throw new Error("Vídeo no encontrado.");
  if (!video.relevant)
    throw new Error(
      "Vídeo excluido. Revisa su clasificación antes de procesarlo.",
    );
  const t = s.transcripts.filter((t) => t.videoId === videoId).at(-1);
  if (!t) throw new Error("Importa una transcripción primero.");
  const existing = s.jobs.find(
    (j) =>
      j.videoId === videoId &&
      j.transcriptHash === t.hash &&
      j.provider === provider,
  );
  if (existing) return existing;
  const segments = s.segments.filter((seg) => seg.transcriptId === t.id);
  const estimated = provider === "ai" ? estimatedCost(segments) : 0;
  if (
    provider === "ai" &&
    (!confirmed ||
      budget <= 0 ||
      estimated > budget ||
      !process.env.AI_API_KEY ||
      !process.env.AI_MODEL)
  )
    throw new Error(
      "Confirma el coste, configura la IA y define un presupuesto suficiente.",
    );
  const job: Job = {
    id: randomUUID(),
    videoId,
    transcriptHash: t.hash,
    status: "queued",
    cursor: 0,
    total: segments.length,
    provider,
    model: provider === "ai" ? process.env.AI_MODEL : undefined,
    budget,
    estimatedCost: estimated,
    createdAt: now(),
    updatedAt: now(),
  };
  s.jobs.push(job);
  return job;
}
export async function runOneJob(
  injectedProvider?: KnowledgeProvider,
  maxSteps = Infinity,
) {
  const worker = randomUUID();
  const claim = await mutate((s) => {
    if (s.settings.stopJobs) return undefined;
    const job = s.jobs.find(
      (j) =>
        j.status === "queued" ||
        (j.status === "running" && Date.parse(j.leaseUntil ?? "") < Date.now()),
    );
    if (!job) return undefined;
    job.status = "running";
    job.leaseOwner = worker;
    job.leaseUntil = new Date(Date.now() + 180000).toISOString();
    job.updatedAt = now();
    s.videos.find((v) => v.id === job.videoId)!.status = "processing";
    return { ...job };
  });
  if (!claim) return false;
  try {
    let count = 0;
    while (count++ < maxSteps) {
      const snapshot = await readState();
      const job = snapshot.jobs.find((j) => j.id === claim.id)!;
      if (
        job.status !== "running" ||
        job.leaseOwner !== worker ||
        snapshot.settings.stopJobs
      )
        break;
      const t = snapshot.transcripts.find(
        (t) => t.videoId === job.videoId && t.hash === job.transcriptHash,
      )!;
      if (job.provider === "ai" && job.model !== process.env.AI_MODEL)
        throw new Error(
          "El modelo cambió desde que se creó el trabajo. Restaura su configuración antes de reanudar.",
        );
      const segs = snapshot.segments
        .filter((seg) => seg.transcriptId === t.id)
        .sort((a, b) => a.ordinal - b.ordinal);
      const seg = segs[job.cursor];
      if (!seg) {
        await mutate((s) => {
          const j = s.jobs.find((j) => j.id === job.id)!;
          if (j.status !== "running" || j.leaseOwner !== worker) return;
          const cs = s.concepts.filter(
            (c) =>
              c.videoId === job.videoId &&
              c.version === `${job.provider}:${job.transcriptHash}`,
          );
          const id = `lesson_${job.id}`;
          if (!s.lessons.some((l) => l.id === id) && cs.length) {
            s.lessons.push({
              id,
              videoId: job.videoId,
              title: s.videos.find((v) => v.id === job.videoId)!.title,
              module: cs[0].topic,
              level: "Intermedio · NL2 → NL5",
              body: cs
                .map(
                  (c) =>
                    `${c.title}\n\n${c.explanation}\n\nCondiciones: ${c.conditions.join(" ")}\nAdvertencias: ${c.warnings.join(" ")}`,
                )
                .join("\n\n———\n\n"),
              objectives: [
                "Identificar las condiciones de cada recomendación.",
                "Contrastar los conceptos con sus fragmentos originales.",
              ],
              prerequisites: ["Cash Hold’em y posiciones conocidas."],
              conceptIds: cs.map((c) => c.id),
              segmentIds: [...new Set(cs.flatMap((c) => c.segmentIds))],
              status: "draft",
              confidence: "Pendiente de revisión personal",
              version: 1,
              demo: s.videos.find((v) => v.id === job.videoId)!.demo,
            });
          }
          j.status = "completed";
          j.leaseOwner = undefined;
          j.leaseUntil = undefined;
          j.updatedAt = now();
          const v = s.videos.find((v) => v.id === j.videoId)!;
          v.status = "needs_review";
          v.processedAt = now();
        });
        break;
      }
      const cached = job.cache?.[seg.hash];
      const reserved =
        job.provider === "ai" && !cached
          ? cost(Math.ceil(seg.text.length / 2) + 800, 4000)
          : 0;
      await mutate((s) => {
        const j = s.jobs.find((j) => j.id === job.id)!;
        if (j.status !== "running" || j.leaseOwner !== worker)
          throw new Error("Trabajo pausado o reasignado.");
        const spent = s.usage
          .filter((u) => u.jobId === j.id)
          .reduce((n, u) => n + u.cost, 0);
        if (spent + reserved > j.budget && j.provider === "ai")
          throw new Error(
            "Presupuesto agotado. Los consumos reservados tras fallos cuentan para evitar dobles cargos.",
          );
        j.leaseUntil = new Date(Date.now() + 180000).toISOString();
        if (j.provider === "ai" && !cached)
          s.usage.push({
            id: randomUUID(),
            jobId: j.id,
            segmentId: seg.id,
            model: process.env.AI_MODEL ?? "configurado",
            input: 0,
            output: 0,
            cost: reserved,
            status: "reserved",
            createdAt: now(),
          });
      });
      const provider =
        injectedProvider ??
        (job.provider === "ai"
          ? new OpenAICompatibleProvider()
          : new ExtractiveProvider());
      const response = cached
        ? { result: cached, input: 0, output: 0 }
        : await provider.extract(seg);
      verifyExtraction(response.result, seg);
      await mutate((s) => {
        const j = s.jobs.find((j) => j.id === job.id)!;
        if (j.leaseOwner !== worker || j.cursor !== job.cursor)
          throw new Error("Checkpoint reasignado.");
        if (j.provider === "ai" && !cached) {
          const u = s.usage
            .filter(
              (u) =>
                u.jobId === j.id &&
                u.segmentId === seg.id &&
                u.status === "reserved",
            )
            .at(-1)!;
          u.input = response.input;
          u.output = response.output;
          u.cost = cost(u.input, u.output);
          u.status = "complete";
          j.cache = { ...j.cache, [seg.hash]: response.result };
        }
        for (const [i, c] of response.result.concepts.entries()) {
          const id = `concept_${hash(`${job.id}:${seg.id}:${i}`).slice(0, 24)}`;
          if (s.concepts.some((c) => c.id === id)) continue;
          const duplicate = s.concepts.find(
            (existing) =>
              existing.videoId === job.videoId &&
              existing.version === `${job.provider}:${job.transcriptHash}` &&
              existing.quote === c.quote &&
              existing.explanation === c.explanation,
          );
          if (duplicate) {
            if (!duplicate.segmentIds.includes(seg.id))
              duplicate.segmentIds.push(seg.id);
            continue;
          }
          s.concepts.push({
            id,
            videoId: job.videoId,
            title: c.title,
            explanation: c.explanation,
            quote: c.quote,
            topic: c.topic,
            conditions: c.conditions,
            warnings: c.warnings,
            segmentIds: [seg.id],
            kind: job.provider === "ai" ? "interpretación IA" : "extracto",
            version: `${job.provider}:${job.transcriptHash}`,
            createdAt: now(),
            practice: {
              question: c.question,
              options: c.options,
              accepted: c.accepted,
              answer: c.answer,
            },
          });
        }
        j.cursor++;
        j.updatedAt = now();
      });
    }
    await mutate((s) => {
      const j = s.jobs.find((j) => j.id === claim.id)!;
      if (j.leaseOwner === worker) {
        if (j.status === "running") j.status = "queued";
        j.leaseUntil = undefined;
        j.leaseOwner = undefined;
      }
    });
    return true;
  } catch (error) {
    await mutate((s) => {
      const j = s.jobs.find((j) => j.id === claim.id)!;
      if (j.leaseOwner !== worker) return;
      j.status = j.status === "paused" ? "paused" : "failed";
      j.error =
        error instanceof Error ? error.message : "Fallo de procesamiento.";
      j.leaseOwner = undefined;
      j.leaseUntil = undefined;
      j.updatedAt = now();
      const video = s.videos.find((v) => v.id === j.videoId)!;
      video.status = "failed";
      video.error = j.error;
    });
    return true;
  }
}
export function generatePractice(s: State, lessonId: string) {
  const l = s.lessons.find(
    (l) => l.id === lessonId && l.status === "published",
  );
  if (!l) throw new Error("Revisa y publica la lección primero.");
  const concepts = s.concepts.filter((c) => l.conceptIds.includes(c.id));
  for (const c of concepts) {
    const id = `practice_${c.id}`;
    if (s.exercises.some((e) => e.id === id)) continue;
    const alternatives = [
      ...new Set(
        concepts
          .filter((o) => o.id !== c.id && o.quote !== c.quote)
          .slice(0, 2)
          .map((o) => o.quote),
      ),
    ];
    if (alternatives.length < 1)
      alternatives.push(
        "La fuente permite aplicar la misma estrategia con independencia del rival y de los rangos.",
      );
    const originalOptions = c.practice?.options ?? [c.quote, ...alternatives];
    const originalAccepted = c.practice?.accepted ?? [0];
    const offset = parseInt(hash(id).slice(0, 4), 16) % originalOptions.length;
    const rotated = originalOptions.map(
      (_, i) => originalOptions[(i + offset) % originalOptions.length],
    );
    const accepted = originalAccepted.map(
      (i) => (i - offset + originalOptions.length) % originalOptions.length,
    );
    s.exercises.push(
      exerciseSchema.parse({
        id,
        lessonId: l.id,
        prompt:
          c.practice?.question ??
          `Recuperación de fuente: ¿qué fragmento documenta «${c.title}»?`,
        options: rotated,
        accepted,
        explanation:
          c.practice?.answer ??
          `Fragmento literal. La interpretación debe contrastarse con el contexto: ${c.conditions.join(" ")} ${c.warnings.join(" ")}`,
        assumptions: [
          "Ejercicio de lectura y atribución; no es una solución de solver.",
        ],
        segmentIds: c.segmentIds,
        difficulty: "intermedio",
        kind: "pendiente",
        demo: l.demo,
      }),
    );
    const cardId = `card_${c.id}`;
    s.cards.push({
      id: cardId,
      lessonId: l.id,
      front: `Explica «${c.title}» y sus condiciones.`,
      back: `${c.explanation}\n${c.conditions.join("\n")}\n${c.warnings.join("\n")}`,
      segmentIds: c.segmentIds,
      demo: l.demo,
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
  return s.exercises.filter((e) => e.lessonId === l.id).length;
}
