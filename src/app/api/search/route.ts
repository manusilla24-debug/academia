import { NextResponse } from "next/server";
import { authenticated } from "@/lib/auth";
import { searchSegments } from "@/lib/db/store";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  if (!(await authenticated()))
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (q.length < 2 || q.length > 500)
    return NextResponse.json(
      { error: "La consulta debe tener de 2 a 500 caracteres." },
      { status: 400 },
    );
  try {
    return NextResponse.json({ segments: await searchSegments(q) });
  } catch {
    return NextResponse.json(
      { error: "No se pudo buscar. Revisa la base de datos y sus índices." },
      { status: 503 },
    );
  }
}
