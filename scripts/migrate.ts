import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
if (!process.env.DATABASE_URL) throw new Error("Falta DATABASE_URL.");
const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  max: 1,
  ssl: "require",
});
try {
  await migrate(drizzle(client), { migrationsFolder: resolve("migrations") });
  await client.begin(async (tx) => {
    await tx.unsafe(readFileSync(resolve("supabase/security.sql"), "utf8"));
  });
  console.log(
    "Migraciones y RLS aplicadas. Configura app_owner y desactiva los registros públicos antes de desplegar.",
  );
} finally {
  await client.end();
}
