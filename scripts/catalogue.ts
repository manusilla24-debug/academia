import catalogue from "../fixtures/channel-catalogue.json";
import { mutate } from "../src/lib/db/store";
import { now } from "../src/lib/domain";
import { classify } from "../src/lib/transcripts";
const added = await mutate((s) => {
  let count = 0;
  for (const item of catalogue.videos) {
    if (s.videos.some((v) => v.youtubeId === item.id)) continue;
    s.videos.push({
      id: `yt_${item.id}`,
      youtubeId: item.id,
      title: item.title,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      sourceType: "youtube",
      metadataSource: "browser-catalogue",
      demo: false,
      ...classify(item.title),
      status: "transcript_missing",
      createdAt: now(),
    });
    count++;
  }
  return count;
});
console.log(
  `${added} referencias públicas añadidas. Catálogo parcial, sin atribuir contenido a vídeos no analizados.`,
);
