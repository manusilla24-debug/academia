import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  demoAllowed,
  sameOrigin,
  signSession,
  supabase,
  validPassword,
  usesSupabaseAuth,
} from "@/lib/auth";
export const runtime = "nodejs";
const limits = new Map<string, { attempts: number; until: number }>();
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Origen no autorizado." },
      { status: 403 },
    );
  try {
    if (Number(req.headers.get("content-length") ?? 0) > 10000)
      throw new Error("Solicitud demasiado grande.");
    const body = z
      .object({
        email: z.string().max(300).optional(),
        password: z.string().max(300).optional(),
        demo: z.boolean().optional(),
        logout: z.boolean().optional(),
      })
      .parse(await req.json());
    const jar = await cookies();
    if (body.logout) {
      if (usesSupabaseAuth()) {
        const client = await supabase();
        await client.auth.signOut();
      }
      jar.delete("poker_session");
      return NextResponse.json({ ok: true });
    }
    const id = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
    const time = Date.now();
    let entry = limits.get(id);
    if (!entry || entry.until < time) {
      entry = { attempts: 0, until: time + 900000 };
      limits.set(id, entry);
    }
    if (limits.size > 1000)
      for (const [k, v] of limits) if (v.until < time) limits.delete(k);
    if (++entry.attempts > 10)
      return NextResponse.json(
        { error: "Demasiados intentos. Espera 15 minutos." },
        { status: 429 },
      );
    if (usesSupabaseAuth()) {
      const client = await supabase();
      const { data, error } = await client.auth.signInWithPassword({
        email: body.email ?? "",
        password: body.password ?? "",
      });
      if (error || data.user?.id !== process.env.OWNER_USER_ID) {
        await client.auth.signOut();
        return NextResponse.json(
          { error: "Credenciales no válidas para el propietario." },
          { status: 401 },
        );
      }
    } else {
      if (!(body.demo && demoAllowed()) && !validPassword(body.password ?? ""))
        return NextResponse.json(
          {
            error: "Contraseña incorrecta o acceso sin configurar.",
          },
          { status: 401 },
        );
      jar.set("poker_session", signSession(), {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 28800,
      });
    }
    limits.delete(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error:
          "No se pudo iniciar sesión. Revisa la configuración del servidor.",
      },
      { status: 400 },
    );
  }
}
