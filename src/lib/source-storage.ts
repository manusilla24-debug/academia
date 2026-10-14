import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { hash } from "./transcripts";
import { supabase } from "./auth";
export interface SourceStorage {
  put(text: string): Promise<string>;
}
export class LocalSourceStorage implements SourceStorage {
  async put(text: string) {
    const dir = resolve("data/sources");
    await mkdir(dir, { recursive: true });
    const key = `${hash(text)}.txt`;
    await writeFile(resolve(dir, key), text, {
      encoding: "utf8",
      flag: "w",
      mode: 0o600,
    });
    return `local:${key}`;
  }
}
export class SupabaseSourceStorage implements SourceStorage {
  async put(text: string) {
    const client = await supabase();
    const key = `${process.env.OWNER_USER_ID}/${hash(text)}.txt`;
    const { error } = await client.storage
      .from("transcripts")
      .upload(key, Buffer.from(text), {
        contentType: "text/plain",
        upsert: false,
      });
    if (
      error &&
      !(
        String("statusCode" in error ? error.statusCode : "") === "409" ||
        error.message.toLowerCase().includes("already exists")
      )
    )
      throw new Error(
        "No se pudo guardar el archivo privado en Supabase Storage. Revisa el bucket y sus políticas.",
      );
    return `supabase:transcripts/${key}`;
  }
}
