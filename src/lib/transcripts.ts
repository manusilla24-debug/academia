import { createHash } from "node:crypto";
import type { Cue, Segment, Transcript } from "./domain";
export const hash = (text: string) =>
  createHash("sha256").update(text).digest("hex");
const clean = (text: string) =>
  text
    .replace(/<[^>]*>/g, "")
    .replace(/\u0000/g, "")
    .replace(/\s+/g, " ")
    .trim();
function seconds(t: string) {
  const p = t.replace(",", ".").split(":").map(Number);
  if (
    p.some((n) => !Number.isFinite(n)) ||
    p.length < 2 ||
    p.at(-1)! >= 60 ||
    p.at(-2)! >= 60
  )
    throw new Error("Timestamp inválido.");
  return p.reduce((a, b) => a * 60 + b, 0);
}
export interface TranscriptProvider {
  parse(text: string, name: string): { cues: Cue[]; format: string };
}
export class FileTranscriptProvider implements TranscriptProvider {
  parse(raw: string, name: string) {
    if (Buffer.byteLength(raw, "utf8") > 8 * 1024 * 1024)
      throw new Error("Máximo 8 MB por transcripción.");
    const text = raw.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
    const format = name.split(".").at(-1)?.toLowerCase() ?? "txt";
    if (!["txt", "srt", "vtt"].includes(format))
      throw new Error("Usa TXT, SRT o VTT.");
    if (text.includes("\u0000"))
      throw new Error("Archivo binario no admitido.");
    let cues: Cue[] = [];
    if (format === "txt" && /^YouTube transcript\r?\n/.test(text)) {
      const timed = text.split("\n").flatMap((line) => {
        const m = line.match(/^\[(\d+(?::\d{2}){1,2})\]\s+(.+)$/);
        if (!m) return [];
        const start = m[1]
          .split(":")
          .map(Number)
          .reduce((a, b) => a * 60 + b, 0);
        return [{ start, text: clean(m[2]) }];
      });
      if (
        !timed.length ||
        timed.some((c, i) => i > 0 && c.start < timed[i - 1].start)
      )
        throw new Error("Exportación de YouTube sin tiempos válidos.");
      cues = timed;
    } else if (format === "txt") {
      cues = text
        .split(/\n\s*\n/)
        .map((t) => ({ text: clean(t) }))
        .filter((c) => c.text);
    } else {
      const lines = text.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(
          /(\d{1,2}:\d{2}(?::\d{2})?[.,]\d{3})\s*-->\s*(\d{1,2}:\d{2}(?::\d{2})?[.,]\d{3})/,
        );
        if (!match) continue;
        const start = seconds(match[1]),
          end = seconds(match[2]);
        if (end <= start || (cues.length && start < (cues.at(-1)?.start ?? 0)))
          throw new Error("Tiempos invertidos o desordenados.");
        const body: string[] = [];
        while (++i < lines.length && lines[i].trim()) body.push(lines[i]);
        const content = clean(body.join(" "));
        if (content) cues.push({ text: content, start, end });
      }
    }
    if (!cues.length || cues.reduce((a, c) => a + c.text.length, 0) < 40)
      throw new Error(
        "Transcripción vacía o demasiado breve (mínimo 40 caracteres).",
      );
    return { cues, format };
  }
}
// Conservative token estimate for Spanish prose: four characters per token + safety margin.
export const estimateTokens = (text: string) => Math.ceil(text.length / 3);
export function segmentTranscript(
  t: Transcript,
  maxChars = 7500,
  overlap = 500,
): Segment[] {
  if (maxChars < 200 || overlap < 0 || overlap >= maxChars / 2)
    throw new Error("Límites de segmentación inválidos.");
  const parts: Cue[] = [];
  for (const cue of t.cues) {
    if (cue.text.length <= maxChars) {
      parts.push(cue);
      continue;
    }
    const sentences = cue.text.match(/[^.!?]+[.!?]*\s*/g) ?? [cue.text];
    for (const sentence of sentences) {
      for (let i = 0; i < sentence.length; i += maxChars)
        parts.push({ ...cue, text: sentence.slice(i, i + maxChars).trim() });
    }
  }
  const groups: Cue[][] = [];
  let current: Cue[] = [];
  let length = 0;
  for (const cue of parts) {
    if (length + cue.text.length + 1 > maxChars && current.length) {
      groups.push(current);
      const tail: Cue[] = [];
      let n = 0;
      for (const c of [...current].reverse()) {
        if (n + c.text.length > overlap) break;
        tail.unshift(c);
        n += c.text.length + 1;
      }
      current = tail;
      length = n;
    }
    current.push(cue);
    length += cue.text.length + 1;
  }
  if (current.length) groups.push(current);
  return groups.map((g, ordinal) => {
    const text = g.map((c) => c.text).join(" ");
    const digest = hash(text);
    return {
      id: `seg_${hash(`${t.id}:${ordinal}:${digest}`).slice(0, 24)}`,
      transcriptId: t.id,
      videoId: t.videoId,
      text,
      hash: digest,
      start: g[0].start,
      end: g.at(-1)?.end,
      ordinal,
    };
  });
}
export function classify(text: string) {
  const excluded =
    /\b(omaha|plo|mtt|sit\s*&?\s*go|torneos?|tournament|wsop|bounty|freeroll|ksop|vlog|alpes|supermarket|patrocinadores?)\b/i.test(
      text,
    );
  const tags = [
    "preflop",
    "flop",
    "turn",
    "river",
    "3-bet",
    "c-bet",
    "exploit",
    "bluffcatch",
    "IP",
    "OOP",
  ].filter((t) =>
    new RegExp(`\\b${t.replace("-", "[- ]")}\\b`, "i").test(text),
  );
  tags.push(
    ...[...text.matchAll(/\bNL\s*(\d+(?:[.,]\d{3})?)(?!\d)/gi)].map(
      (m) => `NL${m[1].replace(/[.,]/g, "")}`,
    ),
  );
  return { relevant: !excluded, tags };
}
