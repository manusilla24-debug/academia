import { readFileSync, statSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { z } from "zod";
import { mutate } from "../src/lib/db/store";
import { youtubeId } from "../src/lib/youtube";
import { addTranscript, queueJob } from "../src/lib/pipeline";
import { now } from "../src/lib/domain";
import { LocalSourceStorage } from "../src/lib/source-storage";
const manifestPath = process.argv
  .find((a) => a.startsWith("--manifest="))
  ?.slice(11);
if (!manifestPath)
  throw new Error("Uso: npm run import -- --manifest=mi-lote.json");
const path = resolve(manifestPath);
const manifest = z
  .array(
    z.object({ url: z.string(), title: z.string().min(3), file: z.string() }),
  )
  .min(1)
  .max(100)
  .parse(JSON.parse(readFileSync(path, "utf8")));
for (const item of manifest) {
  const id = youtubeId(item.url);
  const file = resolve(dirname(path), item.file);
  if (statSync(file).size > 8 * 1024 * 1024)
    throw new Error("Un archivo supera 8 MB.");
  const raw = readFileSync(file, "utf8");
  const storagePath =
    process.env.APP_MODE === "supabase"
      ? undefined
      : await new LocalSourceStorage().put(raw);
  await mutate((s) => {
    let v = s.videos.find((v) => v.youtubeId === id);
    if (!v) {
      v = {
        id: `yt_${id}`,
        youtubeId: id,
        url: `https://www.youtube.com/watch?v=${id}`,
        title: item.title,
        relevant: true,
        tags: [],
        demo: false,
        status: "transcript_missing",
        createdAt: now(),
      };
      s.videos.push(v);
    }
    const t = addTranscript(s, v.id, raw, basename(file));
    if (storagePath) t.storagePath = storagePath;
    if (process.argv.includes("--queue"))
      queueJob(s, v.id, "extractive", 0, false);
  });
  console.log(`Importado: ${item.title}`);
}
console.log(
  "Lote importado. En Supabase el CLI conserva la fuente en PostgreSQL; las subidas desde la app guardan además el original en Storage privado.",
);
