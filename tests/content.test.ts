import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  FileTranscriptProvider,
  segmentTranscript,
  classify,
  hash,
} from "../src/lib/transcripts";
import {
  emptyState,
  exerciseSchema,
  handSchema,
  type Transcript,
} from "../src/lib/domain";
import { seedDemo } from "../src/lib/demo";
import { verifyExtraction, extractionSchema } from "../src/lib/ai";
import { schedule } from "../src/lib/review";
import { searchLocal } from "../src/lib/search";
import { youtubeId } from "../src/lib/youtube";
const parser = new FileTranscriptProvider();
describe("fuentes y segmentación", () => {
  it("parsea SRT y conserva tiempos originales", () => {
    const { cues } = parser.parse(
      readFileSync("fixtures/demo.es.srt", "utf8"),
      "demo.srt",
    );
    expect(cues).toHaveLength(3);
    expect(cues[1].start).toBe(70);
    expect(cues[2].end).toBe(240);
  });
  it("parsea VTT, identificadores y settings sin inventar tiempos", () => {
    const p = parser.parse(
      "WEBVTT\n\nintro\n00:01.000 --> 00:05.000 align:start\n<v Ana>El rango de BB conserva parejas y proyectos frente a BTN.</v>\n",
      "source.vtt",
    );
    expect(p.cues[0]).toEqual({
      start: 1,
      end: 5,
      text: "El rango de BB conserva parejas y proyectos frente a BTN.",
    });
  });
  it("rechaza subtítulos vacíos, tiempos invertidos, fuera de rango y archivos binarios", () => {
    for (const text of [
      "WEBVTT",
      "1\n00:00:10,000 --> 00:00:09,000\nUna mano de valor.",
      "1\n00:99:00,000 --> 01:00:00,000\nUna mano de valor.",
    ])
      expect(() => parser.parse(text, "f.srt")).toThrow();
    expect(() => parser.parse("\u0000".repeat(100), "f.txt")).toThrow();
  });
  it("TXT no atribuye timestamps", () => {
    const p = parser.parse(
      "El juego por rangos depende del contexto del rival y de la calle.",
      "notas.txt",
    );
    expect(p.cues[0].start).toBeUndefined();
  });
  it("divide una transcripción larga con límites y trazabilidad deterministas", () => {
    const text = "El rango de BB contiene parejas y proyectos. ".repeat(6000);
    const parsed = parser.parse(text, "long.txt");
    const t: Transcript = {
      id: "t",
      videoId: "v",
      name: "long.txt",
      hash: hash(text),
      createdAt: "2026-01-01",
      text,
      cues: parsed.cues,
      format: "txt",
      quality: "test",
      language: "es",
    };
    const result = segmentTranscript(t);
    expect(result.length).toBeGreaterThan(30);
    expect(
      result.every(
        (s) =>
          s.text.length <= 7500 &&
          s.transcriptId === "t" &&
          s.start === undefined,
      ),
    ).toBe(true);
    expect(segmentTranscript(t)).toEqual(result);
    expect(result.map((s) => s.text).join(" ")).toContain("proyectos");
  });
  it("clasifica Omaha y torneos como excluidos, cash como relevante", () => {
    expect(classify("NL5 BTN vs BB: c-bet turn").tags).toContain("NL5");
    expect(classify("PLO Omaha review").relevant).toBe(false);
    expect(classify("MTT final torneo").relevant).toBe(false);
    expect(classify("cash 6-max NL10 3-bet pots").relevant).toBe(true);
  });
  it("valida URLs de YouTube sin aceptar hosts parecidos", () => {
    expect(youtubeId("https://youtu.be/abcdefghijk")).toBe("abcdefghijk");
    expect(() =>
      youtubeId("https://youtube.com.evil.test/watch?v=abcdefghijk"),
    ).toThrow();
  });
});
describe("ejercicios, manos y trazabilidad", () => {
  it("demo tiene tres lecciones, cinco ejercicios y fuentes auténticas locales", () => {
    const s = emptyState();
    seedDemo(s);
    expect(s.lessons).toHaveLength(3);
    expect(s.exercises).toHaveLength(5);
    expect(s.hands).toHaveLength(1);
    for (const c of s.concepts) {
      expect(
        c.segmentIds.every((id) =>
          s.segments.some((g) => g.id === id && g.text.includes(c.quote)),
        ),
      ).toBe(true);
    }
    for (const e of s.exercises)
      expect(exerciseSchema.safeParse(e).success).toBe(true);
    expect(seedDemo(s)).toBe(false);
    expect(s.videos[0].url).toBeUndefined();
  });
  it("rechaza cartas duplicadas, board imposible, stack y orden de calles", () => {
    const s = emptyState();
    seedDemo(s);
    const h = s.hands[0];
    expect(handSchema.safeParse({ ...h, hero: ["As", "As"] }).success).toBe(
      false,
    );
    expect(
      handSchema.safeParse({ ...h, board: ["As"], street: "flop" }).success,
    ).toBe(false);
    expect(handSchema.safeParse({ ...h, stack: 2 }).success).toBe(false);
    expect(
      handSchema.safeParse({
        ...h,
        actions: [
          ...h.actions,
          { street: "flop", position: "BB", action: "check" },
        ],
      }).success,
    ).toBe(false);
    expect(handSchema.safeParse({ ...h, pot: 1 }).success).toBe(false);
  });
  it("rechaza ejercicios con respuestas inválidas y duplicadas", () => {
    const s = emptyState();
    seedDemo(s);
    const e = s.exercises[0];
    expect(exerciseSchema.safeParse({ ...e, accepted: [10] }).success).toBe(
      false,
    );
    expect(
      exerciseSchema.safeParse({ ...e, options: ["call", "call"] }).success,
    ).toBe(false);
  });
  it("impide atribuir una cita inventada a la fuente", () => {
    const c = {
      title: "C-bet",
      explanation: "Una interpretación pendiente de revisión.",
      quote: "Una cita que no aparece.",
      topic: "Flop",
      conditions: [],
      warnings: [],
      question: "¿Qué contexto importa?",
      options: ["Rangos", "Resultados"],
      accepted: [0],
      answer: "El contexto de rangos importa.",
    };
    const r = extractionSchema.parse({ concepts: [c] });
    expect(() =>
      verifyExtraction(r, {
        id: "s",
        transcriptId: "t",
        videoId: "v",
        text: "Texto original distinto.",
        hash: "h",
        ordinal: 0,
      }),
    ).toThrow("cita");
  });
  it("recupera contenido real y no responde a términos ausentes", () => {
    const s = emptyState();
    seedDemo(s);
    expect(searchLocal(s, "second barrel turn").length).toBeGreaterThan(0);
    expect(searchLocal(s, "astronomía saturno")).toHaveLength(0);
  });
  it("SM-2 reinicia tras fallo y amplía intervalos tras recordar", () => {
    const base = {
      id: "r",
      cardId: "c",
      ease: 2.5,
      interval: 0,
      repetitions: 0,
      due: "2026-01-01",
      history: [],
    };
    const a = schedule(base, 4, new Date("2026-01-01T00:00:00Z"));
    const b = schedule(a, 4, new Date("2026-01-02T00:00:00Z"));
    expect(a.interval).toBe(1);
    expect(b.interval).toBe(6);
    expect(schedule(b, 1).repetitions).toBe(0);
    expect(() => schedule(base, 9)).toThrow();
  });
});
