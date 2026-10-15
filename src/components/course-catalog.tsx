"use client";
import { useState } from "react";
import { ArrowRight, BookOpen, Check, Clock3, Search } from "lucide-react";
import type { Lesson } from "@/lib/domain";
import {
  compareLessons,
  learningPaths,
  pathFor,
  readingMinutes,
} from "@/lib/learning";
import { Badge, Empty, PageHeading, type Context } from "./lab";

export function CourseCatalog(
  ctx: Context & {
    initialLessonId?: string;
    renderLesson: (l: Lesson, back: () => void) => React.ReactNode;
  },
) {
  const [selected, setSelected] = useState(ctx.initialLessonId ?? "");
  const [query, setQuery] = useState("");
  const [path, setPath] = useState("all");
  const [status, setStatus] = useState("published");
  const [origin, setOrigin] = useState("all");
  const [demo, setDemo] = useState(false);
  const lesson = ctx.s.lessons.find((l) => l.id === selected);
  if (lesson)
    return ctx.renderLesson(lesson, () => {
      setSelected("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  const list = ctx.s.lessons.filter(
    (l) =>
      (demo || !l.demo) &&
      (status === "all" || l.status === status) &&
      (path === "all" || pathFor(l).id === path) &&
      (origin === "all" ||
        (origin === "editorial") ===
          (ctx.s.videos.find((v) => v.id === l.videoId)?.sourceType ===
            "editorial")) &&
      `${l.title} ${l.objectives.join(" ")} ${l.module}`
        .toLocaleLowerCase("es")
        .includes(query.toLocaleLowerCase("es")),
  );
  return (
    <>
      <PageHeading
        eyebrow="APRENDE EL PORQUÉ"
        title="Un temario para pensar mejor."
        subtitle="Empieza por la estrategia. Conecta los conceptos. Aplícalos a tus manos."
      />
      <div className="course-manifesto">
        <BookOpen size={28} />
        <div>
          <span className="eyebrow">CASH 6-MAX · NL2 → NL5 → NL10</span>
          <h2>No colecciones vídeos. Construye criterio.</h2>
          <p>
            Cada clase tiene una idea, un proceso de decisión y una tarea de
            estudio.
          </p>
        </div>
        <span>
          {
            ctx.s.lessons.filter((l) => !l.demo && l.status === "published")
              .length
          }
          <small>clases disponibles</small>
        </span>
      </div>
      <div className="catalog-toolbar">
        <label className="catalog-search">
          <Search size={18} />
          <input
            aria-label="Buscar clases"
            placeholder="Busca un concepto: bluffcatch, valor, turn…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Origen del material"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        >
          <option value="all">Todas las clases</option>
          <option value="editorial">Clases de la ruta</option>
          <option value="channel">Clases con fuente del canal</option>
        </select>
      </div>
      <div className="path-filters" aria-label="Rutas de aprendizaje">
        {[{ id: "all", title: "Todo el temario" }, ...learningPaths].map(
          (p) => (
            <button
              key={p.id}
              className={path === p.id ? "active" : ""}
              aria-pressed={path === p.id}
              onClick={() => setPath(p.id)}
            >
              {p.title}
            </button>
          ),
        )}
      </div>
      <details className="catalog-management">
        <summary>Gestión de clases y borradores</summary>
        <div className="tabs">
          {[
            ["all", "Todas"],
            ["published", "Publicadas"],
            ["draft", "Por revisar"],
            ["rejected", "Rechazadas"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={status === id ? "active" : ""}
              onClick={() => setStatus(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={demo}
            onChange={(e) => setDemo(e.target.checked)}
          />
          Mostrar ejemplos DEMO
        </label>
      </details>
      {status !== "published" && (
        <div className="notice">
          Vista de gestión:{" "}
          {status === "draft"
            ? "borradores por revisar"
            : status === "rejected"
              ? "clases rechazadas"
              : "todos los estados"}
          .{" "}
          <button
            className="text-button"
            onClick={() => setStatus("published")}
          >
            Volver a las clases publicadas
          </button>
        </div>
      )}
      {learningPaths.map((p) => {
        const group = list
          .filter((l) => pathFor(l).id === p.id)
          .sort(compareLessons);
        if (!group.length) return null;
        return (
          <section className="curriculum-module" key={p.id}>
            <div className="module-heading">
              <span className="module-number">{p.number}</span>
              <div>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
              </div>
              <span className="muted">{group.length} clases</span>
            </div>
            <div className="curriculum-lessons">
              {group.map((l, i) => {
                const completed = ctx.s.progress.some(
                  (pr) => pr.lessonId === l.id && pr.completed,
                );
                return (
                  <button
                    className="curriculum-row"
                    key={l.id}
                    onClick={() => {
                      setSelected(l.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <span
                      className={`lesson-number ${completed ? "is-done" : ""}`}
                    >
                      {completed ? (
                        <Check size={17} />
                      ) : (
                        String(i + 1).padStart(2, "0")
                      )}
                    </span>
                    <span>
                      <h3>{l.title}</h3>
                      <small>{l.objectives[0]}</small>
                    </span>
                    <span className="row-meta">
                      {l.demo && <Badge>DEMO</Badge>}
                      {l.status !== "published" && (
                        <Badge>
                          {l.status === "draft" ? "Por revisar" : "Rechazada"}
                        </Badge>
                      )}
                      <Clock3 size={13} />
                      {readingMinutes(l)} min
                    </span>
                    <ArrowRight size={17} />
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
      {!list.length && (
        <Empty title="No hay clases con estos filtros">
          <p>Prueba otro concepto o vuelve a todo el temario.</p>
          <button
            className="text-button"
            onClick={() => {
              setQuery("");
              setPath("all");
              setOrigin("all");
              setStatus("published");
            }}
          >
            Restablecer filtros
          </button>
        </Empty>
      )}
    </>
  );
}
