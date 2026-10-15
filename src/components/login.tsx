"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, LockKeyhole } from "lucide-react";
import { Button } from "./ui/button";
export function Login({ demo, remote }: { demo: boolean; remote: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(body: object) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo conectar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login">
      <section className="login-story">
        <div className="brand">
          <span className="brand-symbol">
            <BookOpen size={22} />
          </span>{" "}
          Poker Study Lab
        </div>
        <div>
          <span className="eyebrow">TU ACADEMIA DE CASH HOLD’EM</span>
          <h1>
            Entiende la mano.
            <br />
            <em>Construye tu criterio.</em>
          </h1>
          <p>
            Aprende la estrategia, trabaja los conceptos y descubre el porqué de
            cada decisión en las revisiones de manos.
          </p>
        </div>
        <small>
          Estudio y revisión fuera de las partidas · NL2 → NL5 → NL10
        </small>
      </section>
      <section className="login-form panel">
        <LockKeyhole size={28} className="accent" />
        <h2>Tu espacio de estudio</h2>
        <p className="muted">
          Acceso privado del propietario. Sin registro público.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void submit({
              email: remote ? String(f.get("email") ?? "") : undefined,
              password: String(f.get("password") ?? ""),
            });
          }}
        >
          {remote && (
            <label>
              Email
              <input
                name="email"
                type="email"
                required
                autoComplete="username"
              />
            </label>
          )}
          <label>
            Contraseña
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </label>
          <Button disabled={busy} type="submit">
            {busy ? "Entrando…" : "Entrar"} <ArrowRight size={16} />
          </Button>
        </form>
        {demo && (
          <>
            <div className="divider" />
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => void submit({ demo: true })}
            >
              Abrir laboratorio local
            </Button>
            <p className="micro">
              Modo de desarrollo. Los ejemplos se cargan solo si los solicitas;
              no se atribuyen al canal.
            </p>
          </>
        )}
        {error && (
          <p role="alert" className="error-box">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
