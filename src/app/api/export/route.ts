import { NextResponse } from "next/server";
import { authenticated } from "@/lib/auth";
import { readState } from "@/lib/db/store";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  if (!(await authenticated()))
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  const s = await readState();
  const markdown = new URL(req.url).searchParams.get("format") === "markdown";
  const content = markdown
    ? s.lessons
        .map(
          (l) =>
            `# ${l.title}\n\nEstado: ${l.status}; versión ${l.version}; ${l.confidence}\n\n${l.body}\n\n## Referencias\n${l.segmentIds
              .map((id) => {
                const g = s.segments.find((g) => g.id === id);
                const v = s.videos.find((v) => v.id === g?.videoId);
                return `- ${v?.title ?? "Fuente"}: ${v?.url ?? "DEMO local"}${g?.start !== undefined ? `&t=${Math.floor(g.start)}s` : ""}; segmento ${id}`;
              })
              .join(
                "\n",
              )}\n\n## Notas personales\n${s.progress.find((p) => p.lessonId === l.id)?.notes ?? ""}`,
        )
        .join("\n\n---\n\n")
    : JSON.stringify(
        { schemaVersion: 1, exportedAt: new Date().toISOString(), ...s },
        null,
        2,
      );
  return new Response(content, {
    headers: {
      "Content-Type": markdown
        ? "text/markdown; charset=utf-8"
        : "application/json",
      "Content-Disposition": `attachment; filename="poker-study-lab.${markdown ? "md" : "json"}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
