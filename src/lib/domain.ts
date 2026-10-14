import { z } from "zod";
import type { Extraction } from "./ai";
export const statuses = [
  "discovered",
  "metadata_ready",
  "transcript_missing",
  "transcript_ready",
  "processing",
  "processed",
  "needs_review",
  "published",
  "failed",
] as const;
export type VideoStatus = (typeof statuses)[number];
export interface Video {
  sourceType?: "youtube" | "editorial" | "demo";
  metadataSource?:
    "youtube-api" | "youtube-rss" | "browser-catalogue" | "manual";
  id: string;
  youtubeId?: string;
  title: string;
  url?: string;
  duration?: number;
  publishedAt?: string;
  thumbnail?: string;
  demo: boolean;
  relevant: boolean;
  tags: string[];
  status: VideoStatus;
  createdAt: string;
  error?: string;
  processedAt?: string;
}
export interface Cue {
  text: string;
  start?: number;
  end?: number;
}
export interface Transcript {
  id: string;
  videoId: string;
  name: string;
  format: string;
  hash: string;
  cues: Cue[];
  createdAt: string;
  quality: string;
  language: string;
  text: string;
  storagePath?: string;
}
export interface Segment {
  id: string;
  transcriptId: string;
  videoId: string;
  text: string;
  hash: string;
  start?: number;
  end?: number;
  ordinal: number;
}
export interface Concept {
  id: string;
  videoId: string;
  title: string;
  explanation: string;
  quote: string;
  segmentIds: string[];
  kind: "extracto" | "interpretación IA";
  conditions: string[];
  warnings: string[];
  topic: string;
  version: string;
  createdAt: string;
  practice?: {
    question: string;
    options: string[];
    accepted: number[];
    answer: string;
  };
}
export interface Lesson {
  id: string;
  videoId: string;
  title: string;
  module: string;
  level: string;
  body: string;
  objectives: string[];
  prerequisites: string[];
  conceptIds: string[];
  segmentIds: string[];
  status: "draft" | "published" | "rejected";
  confidence: string;
  version: number;
  reviewedAt?: string;
  demo: boolean;
  revisions?: { version: number; title: string; body: string; at: string }[];
}
export const card = z
  .string()
  .regex(/^[2-9TJQKA][shdc]$/, "Carta inválida: usa Ah, Ts, 2c…");
export const positions = ["UTG", "HJ", "CO", "BTN", "SB", "BB"] as const;
export const handSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().min(3).max(200),
    stakes: z.enum(["NL2", "NL5", "NL10"]),
    heroPosition: z.enum(positions),
    villainPosition: z.enum(positions),
    stack: z.number().positive().max(1000),
    pot: z.number().nonnegative().max(6000),
    hero: z.array(card).length(2),
    board: z.array(card).max(5),
    street: z.enum(["preflop", "flop", "turn", "river"]),
    actions: z
      .array(
        z.object({
          street: z.enum(["preflop", "flop", "turn", "river"]),
          position: z.enum(positions),
          action: z.enum(["fold", "check", "call", "bet", "raise"]),
          size: z.number().nonnegative().optional(),
        }),
      )
      .max(100),
    notes: z.string().max(10000),
    reasoning: z.string().max(10000),
    question: z.string().max(5000),
    tags: z.array(z.string().max(50)).max(20),
    demo: z.boolean().default(false),
  })
  .superRefine((h, ctx) => {
    if (
      new Set([...h.hero, ...h.board]).size !==
      h.hero.length + h.board.length
    )
      ctx.addIssue({ code: "custom", message: "Hay cartas repetidas." });
    if (h.heroPosition === h.villainPosition)
      ctx.addIssue({
        code: "custom",
        message: "Las posiciones deben ser distintas.",
      });
    const boards = { preflop: 0, flop: 3, turn: 4, river: 5 };
    if (h.board.length !== boards[h.street])
      ctx.addIssue({
        code: "custom",
        message: "Board incompatible con la calle.",
      });
    let previous = 0;
    const streets = ["preflop", "flop", "turn", "river"];
    const invested: Record<string, number> = {};
    for (const a of h.actions) {
      const n = streets.indexOf(a.street);
      if (n < previous || n > streets.indexOf(h.street))
        ctx.addIssue({ code: "custom", message: "Orden de calles inválido." });
      previous = n;
      if (
        ["bet", "raise", "call"].includes(a.action) &&
        (!a.size || a.size <= 0)
      )
        ctx.addIssue({
          code: "custom",
          message: "Indica el importe añadido al bote para call, bet y raise.",
        });
      if (["fold", "check"].includes(a.action) && a.size)
        ctx.addIssue({
          code: "custom",
          message: "Fold/check no añaden fichas.",
        });
      invested[a.position] = (invested[a.position] ?? 0) + (a.size ?? 0);
      if (invested[a.position] > h.stack)
        ctx.addIssue({
          code: "custom",
          message: "Las acciones superan el stack inicial.",
        });
    }
    const added = Object.values(invested).reduce((a, b) => a + b, 0);
    if (added > h.pot + 0.01)
      ctx.addIssue({
        code: "custom",
        message: "El bote es menor que las aportaciones registradas.",
      });
  });
export type Hand = z.infer<typeof handSchema> & {
  id: string;
  createdAt: string;
};
export const exerciseSchema = z
  .object({
    id: z.string(),
    lessonId: z.string(),
    prompt: z.string().min(10),
    options: z.array(z.string().min(1)).min(2).max(6),
    accepted: z.array(z.number().int().nonnegative()).min(1),
    explanation: z.string().min(10),
    assumptions: z.array(z.string()),
    segmentIds: z.array(z.string()),
    difficulty: z.enum(["intermedio", "avanzado"]),
    kind: z.enum(["conceptual", "heurística", "revisado", "pendiente"]),
    demo: z.boolean(),
    hand: handSchema.optional(),
  })
  .superRefine((e, ctx) => {
    if (e.accepted.some((a) => a >= e.options.length))
      ctx.addIssue({
        code: "custom",
        message: "Respuesta fuera de las opciones.",
      });
    if (new Set(e.options).size !== e.options.length)
      ctx.addIssue({ code: "custom", message: "Opciones duplicadas." });
  });
export type Exercise = z.infer<typeof exerciseSchema>;
export interface Attempt {
  id: string;
  exerciseId: string;
  choice: number;
  correct: boolean;
  createdAt: string;
}
export interface Flashcard {
  id: string;
  lessonId: string;
  front: string;
  back: string;
  segmentIds: string[];
  demo: boolean;
}
export interface Review {
  id: string;
  cardId: string;
  ease: number;
  interval: number;
  repetitions: number;
  due: string;
  lastGrade?: number;
  history: { at: string; grade: number }[];
}
export interface Progress {
  id: string;
  lessonId: string;
  completed: boolean;
  favorite: boolean;
  notes: string;
  updatedAt: string;
}
export interface Leak {
  id: string;
  title: string;
  notes: string;
  severity: "baja" | "media" | "alta";
  uncertainty: string;
  worked: boolean;
  evidenceIds: string[];
  lessonIds: string[];
  history: string[];
  demo: boolean;
}
export interface Usage {
  id: string;
  jobId: string;
  segmentId: string;
  model: string;
  input: number;
  output: number;
  cost: number;
  status: "reserved" | "complete";
  createdAt: string;
}
export interface Job {
  id: string;
  videoId: string;
  transcriptHash: string;
  status: "queued" | "running" | "paused" | "completed" | "failed";
  cursor: number;
  total: number;
  provider: "extractive" | "ai";
  model?: string;
  cache?: Record<string, Extraction>;
  budget: number;
  estimatedCost: number;
  leaseUntil?: string;
  leaseOwner?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}
export interface Settings {
  name: string;
  stakes: string;
  format: string;
  level: string;
  goals: string;
  channel: string;
  stopJobs: boolean;
  channelSync?: { channel: string; cursor?: string; updatedAt: string };
}
export interface State {
  videos: Video[];
  transcripts: Transcript[];
  segments: Segment[];
  concepts: Concept[];
  lessons: Lesson[];
  exercises: Exercise[];
  attempts: Attempt[];
  cards: Flashcard[];
  reviews: Review[];
  progress: Progress[];
  hands: Hand[];
  leaks: Leak[];
  usage: Usage[];
  jobs: Job[];
  settings: Settings;
}
export const collections = [
  "videos",
  "transcripts",
  "segments",
  "concepts",
  "lessons",
  "exercises",
  "attempts",
  "cards",
  "reviews",
  "progress",
  "hands",
  "leaks",
  "usage",
  "jobs",
] as const;
export function emptyState(): State {
  return {
    videos: [],
    transcripts: [],
    segments: [],
    concepts: [],
    lessons: [],
    exercises: [],
    attempts: [],
    cards: [],
    reviews: [],
    progress: [],
    hands: [],
    leaks: [],
    usage: [],
    jobs: [],
    settings: {
      name: "Poker Study Lab",
      stakes: "NL2",
      format: "Cash 6-max",
      level: "Consolidar NL5",
      goals: "Recuperar disciplina, pensar en rangos y preparar NL10.",
      channel: "https://www.youtube.com/@ClubdePokerDeTusSue%C3%B1os",
      stopJobs: false,
    },
  };
}
export const now = () => new Date().toISOString();
