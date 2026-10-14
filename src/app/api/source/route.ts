import { NextResponse } from "next/server";
import { authenticated } from "@/lib/auth";
import { readState } from "@/lib/db/store";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  if (!(await authenticated()))
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id || id.length > 100)
    return NextResponse.json(
      { error: "Identificador inválido." },
      { status: 400 },
    );
  try {
    const s = await readState();
    const segment = s.segments.find((g) => g.id === id);
    return segment
      ? NextResponse.json({ segment })
      : NextResponse.json({ error: "Fuente no encontrada." }, { status: 404 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo leer la fuente." },
      { status: 503 },
    );
  }
}
