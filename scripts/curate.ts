import notes from "../src/content/channel-notes.json";
import { mutate } from "../src/lib/db/store";
import { curateSource } from "../src/lib/curation";
for (const note of notes) {
  try {
    console.log(
      (await mutate((s) => curateSource(s, note)))
        ? `Síntesis con fuente creada: ${note.title}`
        : `Síntesis existente: ${note.title}`,
    );
  } catch (e) {
    console.log(
      `Pendiente ${note.videoId}: ${e instanceof Error ? e.message : "No disponible"}`,
    );
  }
}
