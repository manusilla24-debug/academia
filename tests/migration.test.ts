import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
describe("PostgreSQL, referencias y políticas RLS", () => {
  it("aplica SQL, índice full-text y RLS con un único propietario", async () => {
    const db = new PGlite();
    await db.exec(
      `CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid primary key); CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; GRANT USAGE ON SCHEMA auth TO authenticated; CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); CREATE TABLE storage.objects(id text,bucket_id text,name text); CREATE FUNCTION storage.foldername(text) RETURNS text[] LANGUAGE sql AS $$ SELECT string_to_array($1, '/') $$;`,
    );
    await db.exec(
      readFileSync("migrations/0000_flat_chronomancer.sql", "utf8"),
    );
    const security = readFileSync("supabase/security.sql", "utf8");
    await db.exec(security);
    await db.exec(security);
    await db.exec(
      `INSERT INTO auth.users VALUES('11111111-1111-1111-1111-111111111111'),('22222222-2222-2222-2222-222222222222'); INSERT INTO app_owner(user_id) VALUES('11111111-1111-1111-1111-111111111111'); INSERT INTO videos(id,data) VALUES('v','{"title":"River"}');`,
    );
    await expect(
      db.exec(
        `INSERT INTO transcripts(id,data,video_id,hash) VALUES('bad','{}','missing','h')`,
      ),
    ).rejects.toThrow();
    await db.exec(
      `SET ROLE authenticated; SET request.jwt.claim.sub='22222222-2222-2222-2222-222222222222';`,
    );
    expect((await db.query("select * from videos")).rows).toHaveLength(0);
    await expect(
      db.exec(`INSERT INTO videos(id,data) VALUES('illegal','{}')`),
    ).rejects.toThrow();
    await db.exec(
      `SET request.jwt.claim.sub='11111111-1111-1111-1111-111111111111';`,
    );
    expect((await db.query("select * from videos")).rows).toHaveLength(1);
    await db.exec(`RESET ROLE;`);
    expect(
      (
        await db.query(
          `select indexname from pg_indexes where indexname='segment_fts_idx'`,
        )
      ).rows,
    ).toHaveLength(1);
    await db.close();
  }, 30000);
});
