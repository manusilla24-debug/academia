import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import notes from "../src/content/channel-notes.json";
import { additionalSourceNotes } from "../src/content/source-classes";
import { reviewedSessions, reviewClasses } from "../src/content/review-classes";
import { isRemote, mutate, readState } from "../src/lib/db/store";
import { installCurriculum } from "../src/lib/curriculum";
import { curateSource } from "../src/lib/curation";
import { addTranscript } from "../src/lib/pipeline";

// An online SQLite snapshot includes the WAL and leaves the running app intact.
if (!isRemote()) {
  const path = resolve(process.env.LOCAL_DB_PATH ?? "data/poker.db");
  if (existsSync(path)) {
    const db = new DatabaseSync(path);
    const destination = resolve(`data/academy-before-upgrade-${Date.now()}.db`);
    db.prepare("VACUUM INTO ?").run(destination);
    db.close();
    console.log("Copia SQLite anterior a la actualización guardada en data/.");
  }
}

await mutate(installCurriculum);

for (const session of reviewedSessions) {
  const path = resolve(`data/channel-transcripts/${session.id}.txt`);
  if (!existsSync(path)) continue;
  const source = readFileSync(path, "utf8");
  if (
    !source.startsWith("YouTube transcript") ||
    !source.includes(`Video ID: ${session.id}`)
  )
    throw new Error("Exportación de revisión incorrecta.");
  const intervals = reviewClasses.filter((note) => note.videoId === session.id);
  const raw = source
    .split(/\r?\n/)
    .filter((line) => {
      const match = line.match(/^\[(\d+(?::\d{2}){1,2})\]/);
      if (!match) return !line.startsWith("[");
      const t = match[1]
        .split(":")
        .map(Number)
        .reduce((a, b) => a * 60 + b, 0);
      return intervals.some((note) => t >= note.from && t <= note.to);
    })
    .join("\n");
  await mutate((s) => {
    let video = s.videos.find((v) => v.youtubeId === session.id);
    if (!video) {
      video = {
        id: `yt_${session.id}`,
        youtubeId: session.id,
        title: session.title,
        url: `https://www.youtube.com/watch?v=${session.id}`,
        sourceType: "youtube",
        metadataSource: "browser-catalogue",
        duration: session.duration,
        demo: false,
        relevant: true,
        tags: ["Cash", "Revisión de manos"],
        status: "transcript_missing",
        createdAt: new Date().toISOString(),
      };
      s.videos.push(video);
    }
    video.duration = session.duration;
    addTranscript(s, video.id, raw, `${session.id}-reviewed-intervals.txt`);
    video.relevant = true; // Only the manually reviewed cash intervals above are imported.
  });
}

// Only import the reviewed conceptual interval, never the mixed session wholesale.
const sourcePath = resolve("data/channel-transcripts/1Y2f_FdnfXM.txt");
if (existsSync(sourcePath)) {
  const source = readFileSync(sourcePath, "utf8");
  if (
    !source.startsWith("YouTube transcript") ||
    !source.includes("Video ID: 1Y2f_FdnfXM")
  )
    throw new Error("La transcripción no corresponde a la sesión.");
  const raw = source
    .split(/\r?\n/)
    .filter((line) => {
      const match = line.match(/^\[(\d+(?::\d{2}){1,2})\]/);
      if (!match) return !line.startsWith("[");
      const t = match[1]
        .split(":")
        .map(Number)
        .reduce((a, b) => a * 60 + b, 0);
      return t <= 310 || (t >= 2680 && t <= 2848);
    })
    .join("\n");
  await mutate((s) => {
    const video = s.videos.find((v) => v.youtubeId === "1Y2f_FdnfXM");
    if (!video) return;
    const relevant = video.relevant;
    addTranscript(s, video.id, raw, "1Y2f_FdnfXM-selected.txt");
    video.relevant = relevant;
  });
}

for (const note of [...notes, ...additionalSourceNotes, ...reviewClasses]) {
  try {
    await mutate((s) => curateSource(s, note));
  } catch (error) {
    console.log(
      `Pendiente ${note.slug}: ${error instanceof Error ? error.message : "fuente no disponible"}`,
    );
  }
}
const state = await readState();
console.log(
  JSON.stringify(
    {
      classes: state.lessons.filter((l) => !l.demo && l.status === "published")
        .length,
      sourceClasses: state.lessons.filter(
        (l) => l.id.startsWith("channel_") && l.status === "published",
      ).length,
      exercises: state.exercises.filter((e) => !e.demo).length,
      flashcards: state.cards.filter((c) => !c.demo).length,
    },
    null,
    2,
  ),
);
