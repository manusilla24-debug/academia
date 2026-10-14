import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { authenticated, sameOrigin } from "@/lib/auth";
import { mutate, readState } from "@/lib/db/store";
import { now, handSchema, type Video } from "@/lib/domain";
import { youtubeId, YouTubeMetadataProvider } from "@/lib/youtube";
import { YouTubeRssMetadataProvider } from "@/lib/youtube-rss";
import { addTranscript, queueJob, generatePractice } from "@/lib/pipeline";
import { estimatedCost } from "@/lib/ai";
import { schedule } from "@/lib/review";
import { seedDemo } from "@/lib/demo";
import { FileTranscriptProvider } from "@/lib/transcripts";
import {
  LocalSourceStorage,
  SupabaseSourceStorage,
} from "@/lib/source-storage";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function message(e: unknown) {
  if (e instanceof z.ZodError)
    return e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" · ");
  return e instanceof Error ? e.message : "No se pudo completar la operación.";
}
const action = z.discriminatedUnion("op", [
  z.object({ op: z.literal("seed") }),
  z.object({ op: z.literal("importUrls"), urls: z.string().max(20000) }),
  z.object({
    op: z.literal("sync"),
    channel: z.string().max(500),
    pageToken: z.string().max(500).optional(),
  }),
  z.object({
    op: z.literal("transcript"),
    videoId: z.string(),
    name: z.string().max(200),
    text: z.string().max(8 * 1024 * 1024),
  }),
  z.object({
    op: z.literal("classification"),
    videoId: z.string(),
    relevant: z.boolean(),
    tags: z.array(z.string().max(30)).max(20),
  }),
  z.object({ op: z.literal("estimate"), videoId: z.string() }),
  z.object({
    op: z.literal("queue"),
    videoId: z.string(),
    provider: z.enum(["extractive", "ai"]),
    budget: z.number().min(0).max(1000),
    confirmed: z.boolean(),
  }),
  z.object({
    op: z.literal("job"),
    jobId: z.string(),
    status: z.enum(["paused", "queued"]),
  }),
  z.object({
    op: z.literal("lesson"),
    lessonId: z.string(),
    title: z.string().min(3).max(200),
    module: z.string().max(100),
    body: z.string().min(20).max(200000),
    status: z.enum(["draft", "published", "rejected"]),
  }),
  z.object({ op: z.literal("practice"), lessonId: z.string() }),
  z.object({ op: z.literal("exerciseReview"), exerciseId: z.string() }),
  z.object({
    op: z.literal("progress"),
    lessonId: z.string(),
    completed: z.boolean(),
    favorite: z.boolean(),
    notes: z.string().max(10000),
  }),
  z.object({
    op: z.literal("attempt"),
    exerciseId: z.string(),
    choice: z.number().int().min(0).max(5),
  }),
  z.object({
    op: z.literal("review"),
    cardId: z.string(),
    grade: z.number().int().min(0).max(5),
  }),
  z.object({ op: z.literal("hand"), hand: handSchema }),
  z.object({
    op: z.literal("leak"),
    id: z.string().optional(),
    title: z.string().min(3).max(200),
    notes: z.string().max(10000),
    severity: z.enum(["baja", "media", "alta"]),
    uncertainty: z.string().max(500),
    worked: z.boolean(),
    evidenceIds: z.array(z.string()).max(100),
    lessonIds: z.array(z.string()).max(100),
  }),
  z.object({
    op: z.literal("settings"),
    name: z.string().min(1).max(80),
    stakes: z.enum(["NL2", "NL5", "NL10"]),
    format: z.enum(["Cash 6-max", "Cash heads-up", "Cash full-ring"]),
    level: z.string().max(100),
    goals: z.string().max(2000),
    channel: z.string().max(500),
    stopJobs: z.boolean(),
  }),
]);
export async function GET() {
  if (!(await authenticated()))
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  try {
    const s = await readState();
    return NextResponse.json({
      ...s,
      jobs: s.jobs.map((job) => {
        const { cache, ...metadata } = job;
        void cache;
        return metadata;
      }),
      transcripts: s.transcripts.map((t) => ({ ...t, text: "", cues: [] })),
      segments: s.segments.map((g) => ({ ...g, text: g.text.slice(0, 500) })),
      capabilities: {
        now: Date.now(),
        youtube: !!process.env.YOUTUBE_API_KEY,
        ai: !!process.env.AI_API_KEY && !!process.env.AI_MODEL,
        model: process.env.AI_MODEL ?? "Sin configurar",
        storage:
          process.env.APP_MODE === "supabase"
            ? "PostgreSQL / Supabase"
            : "SQLite local",
        mode: process.env.APP_MODE ?? "local",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "No se puede leer la base de datos. Revisa las migraciones y DATABASE_URL.",
      },
      { status: 503 },
    );
  }
}
export async function POST(req: Request) {
  if (!(await authenticated()))
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Origen no autorizado." },
      { status: 403 },
    );
  try {
    if (Number(req.headers.get("content-length") ?? 0) > 10 * 1024 * 1024)
      throw new Error("Solicitud demasiado grande.");
    const raw = await req.text();
    if (Buffer.byteLength(raw) > 10 * 1024 * 1024)
      throw new Error("Solicitud demasiado grande.");
    const a = action.parse(JSON.parse(raw));
    if (a.op === "estimate") {
      const s = await readState();
      const t = s.transcripts.filter((t) => t.videoId === a.videoId).at(-1);
      if (!t) throw new Error("Importa una transcripción.");
      const segments = s.segments.filter((g) => g.transcriptId === t.id);
      return NextResponse.json({
        segments: segments.length,
        cost: estimatedCost(segments),
      });
    }
    if (a.op === "sync") {
      const page = await (
        process.env.YOUTUBE_API_KEY
          ? new YouTubeMetadataProvider()
          : new YouTubeRssMetadataProvider()
      ).channel(a.channel, a.pageToken);
      const added = await mutate((s) => {
        let n = 0;
        for (const video of page.videos) {
          const existing = s.videos.find(
            (v) => v.youtubeId === video.youtubeId,
          );
          if (existing) {
            Object.assign(existing, {
              title: video.title,
              duration: video.duration,
              publishedAt: video.publishedAt,
              thumbnail: video.thumbnail,
            });
          } else {
            s.videos.push(video);
            n++;
          }
        }
        return n;
      });
      return NextResponse.json({
        added,
        nextPageToken: "nextPageToken" in page ? page.nextPageToken : undefined,
        limited: "limited" in page && page.limited,
      });
    }
    if (a.op === "importUrls") {
      const ids = [
        ...new Set(a.urls.split(/\s+/).filter(Boolean).map(youtubeId)),
      ];
      if (ids.length < 1 || ids.length > 50)
        throw new Error("Importa entre 1 y 50 URLs por lote.");
      const videos: Video[] = process.env.YOUTUBE_API_KEY
        ? await new YouTubeMetadataProvider().videos(ids)
        : ids.map((id) => ({
            id: `yt_${id}`,
            youtubeId: id,
            url: `https://www.youtube.com/watch?v=${id}`,
            title: `Vídeo ${id} · metadatos pendientes`,
            demo: false,
            relevant: true,
            tags: [],
            status: "transcript_missing",
            createdAt: now(),
          }));
      const added = await mutate((s) => {
        let n = 0;
        for (const v of videos)
          if (!s.videos.some((o) => o.youtubeId === v.youtubeId)) {
            s.videos.push(v);
            n++;
          }
        return n;
      });
      return NextResponse.json({
        added,
        inaccessible: ids.length - videos.length,
      });
    }
    if (a.op === "transcript") {
      new FileTranscriptProvider().parse(a.text, a.name);
      const path = await (
        process.env.APP_MODE === "supabase"
          ? new SupabaseSourceStorage()
          : new LocalSourceStorage()
      ).put(a.text);
      const id = await mutate((s) => {
        const transcript = addTranscript(s, a.videoId, a.text, a.name);
        transcript.storagePath = path;
        return transcript.id;
      });
      return NextResponse.json({ ok: true, result: id });
    }
    const result = await mutate((s) => {
      switch (a.op) {
        case "seed":
          return seedDemo(s);
        case "classification": {
          const v = s.videos.find((v) => v.id === a.videoId);
          if (!v) throw new Error("Vídeo no encontrado.");
          v.relevant = a.relevant;
          v.tags = a.tags;
          return v.id;
        }
        case "queue":
          return queueJob(s, a.videoId, a.provider, a.budget, a.confirmed);
        case "job": {
          const j = s.jobs.find((j) => j.id === a.jobId);
          if (!j) throw new Error("Trabajo no encontrado.");
          if (j.status === "completed")
            throw new Error("Trabajo ya completado.");
          if (
            a.status === "queued" &&
            j.leaseUntil &&
            Date.parse(j.leaseUntil) > Date.now()
          )
            throw new Error("Espera a que el worker libere su checkpoint.");
          const current = s.transcripts
            .filter((t) => t.videoId === j.videoId)
            .at(-1);
          if (a.status === "queued" && current?.hash !== j.transcriptHash)
            throw new Error("La fuente cambió: crea un trabajo nuevo.");
          j.status = a.status;
          j.error = undefined;
          j.updatedAt = now();
          return j.id;
        }
        case "lesson": {
          const l = s.lessons.find((l) => l.id === a.lessonId);
          if (!l) throw new Error("Lección no encontrada.");
          l.revisions = [
            ...(l.revisions ?? []),
            { version: l.version, title: l.title, body: l.body, at: now() },
          ];
          l.title = a.title;
          l.module = a.module;
          l.body = a.body;
          l.status = a.status;
          l.version++;
          if (a.status === "published") {
            if (
              !l.segmentIds.length ||
              l.segmentIds.some((id) => !s.segments.some((g) => g.id === id))
            )
              throw new Error("No hay trazabilidad suficiente.");
            l.reviewedAt = now();
            l.confidence =
              "Revisada por el propietario; no verificada por solver";
            s.videos.find((v) => v.id === l.videoId)!.status = "published";
          }
          return l.id;
        }
        case "practice":
          return generatePractice(s, a.lessonId);
        case "exerciseReview": {
          const e = s.exercises.find((e) => e.id === a.exerciseId);
          if (
            !e ||
            !e.segmentIds.length ||
            e.segmentIds.some((id) => !s.segments.some((g) => g.id === id))
          )
            throw new Error("Faltan referencias válidas del ejercicio.");
          e.kind = "revisado";
          return e.id;
        }
        case "progress": {
          if (!s.lessons.some((l) => l.id === a.lessonId))
            throw new Error("Lección no encontrada.");
          const p = s.progress.find((p) => p.lessonId === a.lessonId);
          const value = {
            id: p?.id ?? randomUUID(),
            lessonId: a.lessonId,
            completed: a.completed,
            favorite: a.favorite,
            notes: a.notes,
            updatedAt: now(),
          };
          if (p) Object.assign(p, value);
          else s.progress.push(value);
          return value.id;
        }
        case "attempt": {
          const e = s.exercises.find((e) => e.id === a.exerciseId);
          if (
            !e ||
            e.kind === "pendiente" ||
            a.choice >= e.options.length ||
            !s.lessons.some(
              (l) => l.id === e.lessonId && l.status === "published",
            )
          )
            throw new Error("Ejercicio no disponible.");
          const attempt = {
            id: randomUUID(),
            exerciseId: e.id,
            choice: a.choice,
            correct: e.accepted.includes(a.choice),
            createdAt: now(),
          };
          s.attempts.push(attempt);
          return attempt;
        }
        case "review": {
          const i = s.reviews.findIndex((r) => r.cardId === a.cardId);
          if (i < 0) throw new Error("Ficha no encontrada.");
          s.reviews[i] = schedule(s.reviews[i], a.grade);
          return s.reviews[i];
        }
        case "hand": {
          const existing = s.hands.find((h) => h.id === a.hand.id);
          const h = {
            ...a.hand,
            id: existing?.id ?? randomUUID(),
            createdAt: existing?.createdAt ?? now(),
          };
          if (existing) Object.assign(existing, h);
          else s.hands.push(h);
          return h.id;
        }
        case "leak": {
          if (
            a.evidenceIds.some(
              (id) =>
                !s.hands.some((h) => h.id === id) &&
                !s.attempts.some((t) => t.id === id),
            )
          )
            throw new Error("Evidencia no encontrada.");
          if (a.lessonIds.some((id) => !s.lessons.some((l) => l.id === id)))
            throw new Error("Lección no encontrada.");
          const existing = s.leaks.find((l) => l.id === a.id);
          const value = {
            ...a,
            id: existing?.id ?? randomUUID(),
            history: [
              ...(existing?.history ?? []),
              `${now()}: ${a.worked ? "trabajado" : "abierto"} · ${a.notes}`,
            ],
            demo: existing?.demo ?? false,
          };
          if (existing) Object.assign(existing, value);
          else s.leaks.push(value);
          return value.id;
        }
        case "settings": {
          const { op: _, ...settings } = a;
          void _;
          s.settings = { ...s.settings, ...settings };
          return true;
        }
      }
    });
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json({ error: message(e) }, { status: 400 });
  }
}
