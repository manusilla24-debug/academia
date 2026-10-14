import {
  pgTable,
  text,
  jsonb,
  integer,
  boolean,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
const row = () => ({
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
});
export const videos = pgTable("videos", {
  ...row(),
  youtubeId: text("youtube_id").unique(),
});
export const transcripts = pgTable(
  "transcripts",
  {
    ...row(),
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id),
    hash: text("hash").notNull(),
  },
  (t) => [index("transcript_video_idx").on(t.videoId)],
);
export const segments = pgTable(
  "segments",
  {
    ...row(),
    transcriptId: text("transcript_id")
      .notNull()
      .references(() => transcripts.id),
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id),
    body: text("body").notNull(),
    ordinal: integer("ordinal").notNull(),
  },
  (t) => [
    index("segment_transcript_idx").on(t.transcriptId),
    index("segment_fts_idx").using(
      "gin",
      sql`to_tsvector('spanish', ${t.body})`,
    ),
  ],
);
export const concepts = pgTable("concepts", {
  ...row(),
  videoId: text("video_id")
    .notNull()
    .references(() => videos.id),
});
export const lessons = pgTable("lessons", {
  ...row(),
  videoId: text("video_id")
    .notNull()
    .references(() => videos.id),
});
export const conceptSources = pgTable("concept_sources", {
  id: text("id").primaryKey(),
  conceptId: text("concept_id")
    .notNull()
    .references(() => concepts.id),
  segmentId: text("segment_id")
    .notNull()
    .references(() => segments.id),
});
export const lessonSources = pgTable("lesson_sources", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id),
  segmentId: text("segment_id")
    .notNull()
    .references(() => segments.id),
});
export const exercises = pgTable("exercises", {
  ...row(),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id),
});
export const attempts = pgTable("attempts", {
  ...row(),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id),
});
export const cards = pgTable("cards", {
  ...row(),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id),
});
export const reviews = pgTable("reviews", {
  ...row(),
  cardId: text("card_id")
    .notNull()
    .unique()
    .references(() => cards.id),
});
export const progress = pgTable("progress", {
  ...row(),
  lessonId: text("lesson_id")
    .notNull()
    .unique()
    .references(() => lessons.id),
});
export const hands = pgTable("hands", row());
export const leaks = pgTable("leaks", row());
export const jobs = pgTable("jobs", {
  ...row(),
  videoId: text("video_id")
    .notNull()
    .references(() => videos.id),
});
export const usage = pgTable("usage", {
  ...row(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id),
  segmentId: text("segment_id")
    .notNull()
    .references(() => segments.id),
});
export const settings = pgTable(
  "settings",
  {
    id: text("id").primaryKey(),
    data: jsonb("data").notNull(),
    initialized: boolean("initialized").notNull().default(false),
  },
  (t) => [check("settings_singleton", sql`${t.id} = 'owner'`)],
);
