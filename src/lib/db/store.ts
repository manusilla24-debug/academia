import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import { collections, emptyState, type State } from "../domain";
import { queryTokens, searchLocal } from "../search";

let local: DatabaseSync | undefined;
function localDb() {
  if (process.env.VERCEL)
    throw new Error(
      "Vercel requiere APP_MODE=supabase; SQLite local no es persistente en Vercel.",
    );
  if (!local) {
    const path = resolve(process.env.LOCAL_DB_PATH ?? "data/poker.db");
    mkdirSync(dirname(path), { recursive: true });
    local = new DatabaseSync(path);
    local.exec(
      "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=15000; CREATE TABLE IF NOT EXISTS workspace (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL);",
    );
  }
  return local;
}
let remote: ReturnType<typeof drizzle> | undefined;
function pg() {
  if (!remote) {
    if (!process.env.DATABASE_URL) throw new Error("Falta DATABASE_URL.");
    remote = drizzle(
      postgres(process.env.DATABASE_URL, {
        prepare: false,
        max: 3,
        ssl: "require",
      }),
    );
  }
  return remote;
}
export function isRemote() {
  return process.env.APP_MODE === "supabase";
}
const order = [
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
  "jobs",
  "usage",
] as const;
type Row = { id: string; data: unknown };
type RecordData = Record<string, unknown> & { id: string };
function values(key: (typeof order)[number], data: RecordData) {
  const value: Record<string, unknown> = { id: data.id, data };
  if (["transcripts", "segments", "concepts", "lessons", "jobs"].includes(key))
    value.videoId = data.videoId;
  if (key === "videos") value.youtubeId = data.youtubeId ?? null;
  if (key === "transcripts") value.hash = data.hash;
  if (key === "segments") {
    value.transcriptId = data.transcriptId;
    value.body = data.text;
    value.ordinal = data.ordinal;
  }
  if (["exercises", "cards", "progress"].includes(key))
    value.lessonId = data.lessonId;
  if (key === "attempts") value.exerciseId = data.exerciseId;
  if (key === "reviews") value.cardId = data.cardId;
  if (key === "usage") {
    value.jobId = data.jobId;
    value.segmentId = data.segmentId;
  }
  return value;
}
type Tx = Parameters<Parameters<ReturnType<typeof pg>["transaction"]>[0]>[0];
async function loadPg(tx: Tx) {
  const s = emptyState();
  for (const key of collections) {
    const rows = (await tx
      .select()
      .from(schema[key])
      .orderBy(schema[key].id)) as Row[];
    (s[key] as unknown[]) = rows.map((r) => r.data);
  }
  s.transcripts.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  s.jobs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const setting = await tx.select().from(schema.settings);
  if (setting[0]) s.settings = setting[0].data as State["settings"];
  return s;
}
export async function readState(): Promise<State> {
  if (isRemote()) return pg().transaction(loadPg);
  const r = localDb().prepare("SELECT data FROM workspace WHERE id=1").get() as
    { data: string } | undefined;
  return r ? (JSON.parse(r.data) as State) : emptyState();
}
export async function searchSegments(q: string) {
  if (!isRemote()) return searchLocal(await readState(), q);
  const terms = queryTokens(q);
  if (!terms.length) return [];
  const query = terms
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter(Boolean)
    .join(" | ");
  const rows = await pg().execute(
    sql`select data from segments where to_tsvector('spanish', body) @@ to_tsquery('spanish', ${query}) order by ts_rank(to_tsvector('spanish', body), to_tsquery('spanish', ${query})) desc limit 15`,
  );
  return Array.from(rows).map((r) => r.data as State["segments"][number]);
}
// All changes are serialized across browser and worker processes. External calls never hold this lock.
export async function mutate<T>(fn: (s: State) => T): Promise<T> {
  if (!isRemote()) {
    const db = localDb();
    db.exec("BEGIN IMMEDIATE");
    try {
      const row = db.prepare("SELECT data FROM workspace WHERE id=1").get() as
        { data: string } | undefined;
      const s: State = row ? JSON.parse(row.data) : emptyState();
      const result = fn(s);
      db.prepare(
        "INSERT INTO workspace(id,data) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data",
      ).run(JSON.stringify(s));
      db.exec("COMMIT");
      return result;
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  }
  return pg().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(7192831)`);
    const s = await loadPg(tx);
    const before = new Map(
      order.flatMap((key) =>
        s[key].map((r) => [`${key}:${r.id}`, JSON.stringify(r)] as const),
      ),
    );
    const result = fn(s);
    for (const key of order) {
      for (const entry of s[key]) {
        if (before.get(`${key}:${entry.id}`) === JSON.stringify(entry))
          continue;
        const value = values(key, entry as unknown as RecordData);
        await tx
          .insert(schema[key])
          .values(value as never)
          .onConflictDoUpdate({ target: schema[key].id, set: value });
      }
    }
    for (const c of s.concepts)
      for (const id of c.segmentIds)
        await tx
          .insert(schema.conceptSources)
          .values({ id: `${c.id}:${id}`, conceptId: c.id, segmentId: id })
          .onConflictDoNothing();
    for (const l of s.lessons)
      for (const id of l.segmentIds)
        await tx
          .insert(schema.lessonSources)
          .values({ id: `${l.id}:${id}`, lessonId: l.id, segmentId: id })
          .onConflictDoNothing();
    await tx
      .insert(schema.settings)
      .values({ id: "owner", data: s.settings, initialized: true })
      .onConflictDoUpdate({
        target: schema.settings.id,
        set: { data: s.settings, initialized: true },
      });
    return result;
  });
}
