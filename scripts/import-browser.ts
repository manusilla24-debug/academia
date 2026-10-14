import { readFileSync, mkdirSync, copyFileSync } from "node:fs";
import { resolve, basename } from "node:path";
import { z } from "zod";
import { mutate } from "../src/lib/db/store";
import { addTranscript, queueJob } from "../src/lib/pipeline";
import { now } from "../src/lib/domain";
const manifestPath = process.argv[2];
if (!manifestPath)
  throw new Error("Indica un manifiesto privado de exportaciones autorizadas.");
const sources = z
  .array(
    z.object({
      id: z.string().regex(/^[\w-]{11}$/),
      title: z.string(),
      path: z.string(),
      duration: z.number().optional(),
      from: z.number().nonnegative().optional(),
      to: z.number().positive().optional(),
      cashReviewed: z.boolean().optional(),
    }),
  )
  .parse(JSON.parse(readFileSync(resolve(manifestPath), "utf8")));
mkdirSync(resolve("data/channel-transcripts"), { recursive: true });
for (const source of sources) {
  let raw = readFileSync(source.path, "utf8");
  if (
    !raw.startsWith("YouTube transcript") ||
    !raw.includes(`Video ID: ${source.id}`)
  )
    throw new Error("La exportación no corresponde al vídeo.");
  if (source.from !== undefined || source.to !== undefined)
    raw = raw
      .split(/\r?\n/)
      .filter((line) => {
        const m = line.match(/^\[(\d+(?::\d{2}){1,2})\]/);
        if (!m) return !line.startsWith("[");
        const t = m[1]
          .split(":")
          .map(Number)
          .reduce((a, b) => a * 60 + b, 0);
        return t >= (source.from ?? 0) && t <= (source.to ?? Infinity);
      })
      .join("\n");
  const dest = resolve("data/channel-transcripts", `${source.id}.txt`);
  copyFileSync(source.path, dest);
  await mutate((s) => {
    let v = s.videos.find((v) => v.youtubeId === source.id);
    if (!v) {
      v = {
        id: `yt_${source.id}`,
        youtubeId: source.id,
        title: source.title,
        url: `https://www.youtube.com/watch?v=${source.id}`,
        demo: false,
        sourceType: "youtube",
        metadataSource: "browser-catalogue",
        duration: source.duration,
        relevant: true,
        tags: [],
        status: "transcript_missing",
        createdAt: now(),
      };
      s.videos.push(v);
    }
    const t = addTranscript(s, v.id, raw, basename(dest));
    if (source.cashReviewed) v.relevant = true;
    t.storagePath = `local:channel-transcripts/${source.id}.txt`;
    queueJob(s, v.id, "extractive", 0, false);
  });
  console.log(`Fuente legítima importada: ${source.title}`);
}
