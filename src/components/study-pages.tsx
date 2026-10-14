"use client";
import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Heart,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import type { Lesson, Segment } from "@/lib/domain";
import { Button } from "./ui/button";
import { HandTable } from "./hand-table";
import { HandEditor } from "./hand-editor";
import { Badge, Empty, PageHeading, SourceLinks, type Context } from "./lab";

export function Academy(ctx: Context & { initialLessonId?: string }) {
  const { s } = ctx;
  const [selected, setSelected] = useState(ctx.initialLessonId ?? "");
  const [filter, setFilter] = useState("published");
  const [origin, setOrigin] = useState("all");
  const [showDemo, setShowDemo] = useState(false);
  const lesson = s.lessons.find((l) => l.id === selected);
  if (lesson)
    return (
      <LessonView
        {...ctx}
        lesson={lesson}
        back={() => setSelected("")}
        key={lesson.id}
      />
    );
  const list = s.lessons.filter(
    (l) =>
      (showDemo || !l.demo) &&
      (filter === "all" || l.status === filter) &&
      (origin === "all" ||
        (origin === "editorial") ===
          (s.videos.find((v) => v.id === l.videoId)?.sourceType ===
            "editorial")),
  );
  const modules = [...new Set(list.map((l) => l.module))];
  return (
    <>
      <PageHeading
        eyebrow="CONOCIMIENTO CON ESTRUCTURA"
        title="Mi academia"
        subtitle="Lecciones con condiciones, excepciones y referencias. Publica solo lo que hayas revisado."
      />
      <div className="study-route-intro">
        <div>
          <h2>Ruta de cash: NL2 → NL5 → NL10</h2>
          <p>
            Fundamentos intermedios, decisiones y revisión fuera de las
            partidas.
          </p>
        </div>
        <span>
          {s.lessons.filter((l) => !l.demo && l.status === "published").length}{" "}
          lecciones disponibles
        </span>
      </div>
      <label className="checkbox show-demo-toggle">
        <input
          type="checkbox"
          checked={showDemo}
          onChange={(e) => setShowDemo(e.target.checked)}
        />{" "}
        Mostrar ejemplos DEMO
      </label>
      <label className="origin-filter">
        Origen del material
        <select value={origin} onChange={(e) => setOrigin(e.target.value)}>
          <option value="all">Ruta y contenido del canal</option>
          <option value="channel">Fuentes del canal</option>
          <option value="editorial">Guía editorial propia</option>
        </select>
      </label>
      <div className="tabs">
        {[
          ["all", "Todas"],
          ["published", "Publicadas"],
          ["draft", "Por revisar"],
          ["rejected", "Rechazadas"],
        ].map(([v, label]) => (
          <button
            className={filter === v ? "active" : ""}
            key={v}
            onClick={() => setFilter(v)}
          >
            {label}
          </button>
        ))}
      </div>
      {modules.map((m) => (
        <section className="academy-module" key={m}>
          <div className="section-heading">
            <h2>{m}</h2>
            <span className="muted">
              {list.filter((l) => l.module === m).length} lecciones
            </span>
          </div>
          <div className="academy-grid">
            {list
              .filter((l) => l.module === m)
              .map((l) => (
                <button
                  className="panel academy-card"
                  key={l.id}
                  onClick={() => setSelected(l.id)}
                >
                  <div className="tag-row">
                    <Badge green={l.status === "published"}>
                      {l.status === "published"
                        ? "Publicada"
                        : l.status === "draft"
                          ? "Por revisar"
                          : "Rechazada"}
                    </Badge>
                    {l.demo && <Badge>DEMO</Badge>}
                    {!l.demo && (
                      <Badge>
                        {s.videos.find((v) => v.id === l.videoId)
                          ?.sourceType === "editorial"
                          ? "Guía propia"
                          : "Con fuente"}
                      </Badge>
                    )}
                    {s.progress.find((p) => p.lessonId === l.id)?.favorite && (
                      <Heart size={14} className="accent" />
                    )}
                  </div>
                  <BookOpen size={24} className="accent" />
                  <h3>{l.title}</h3>
                  <p>{l.level}</p>
                  <div className="video-footer">
                    <small>
                      {s.progress.find((p) => p.lessonId === l.id)?.completed
                        ? "Lectura completada"
                        : `${l.segmentIds.length} referencias originales`}
                    </small>
                    <ArrowRight size={17} />
                  </div>
                </button>
              ))}
          </div>
        </section>
      ))}
      {!list.length && (
        <Empty title="Tu temario empieza en las fuentes">
          <p>
            Importa y procesa una transcripción desde Biblioteca. Las lecciones
            aparecerán primero como borradores.
          </p>
          <Button onClick={() => ctx.navigate("library")}>
            Ir a biblioteca
          </Button>
        </Empty>
      )}
    </>
  );
}
function LessonView({
  lesson: l,
  back,
  ...ctx
}: Context & { lesson: Lesson; back: () => void }) {
  const { s, act, busy, notify } = ctx;
  const progress = s.progress.find((p) => p.lessonId === l.id);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(l.title);
  const [body, setBody] = useState(l.body);
  const [module, setModule] = useState(l.module);
  const [notes, setNotes] = useState(progress?.notes ?? "");
  const [reviewed, setReviewed] = useState(false);
  async function save(status: Lesson["status"]) {
    const r = await act({
      op: "lesson",
      lessonId: l.id,
      title,
      body,
      module,
      status,
    });
    if (r) {
      setEditing(false);
      notify(
        status === "published"
          ? "Lección revisada y publicada."
          : "Versión guardada.",
      );
    }
  }
  return (
    <>
      <button className="text-button" onClick={back}>
        ← Volver a mi academia
      </button>
      <PageHeading
        eyebrow={l.module.toUpperCase()}
        title={l.title}
        subtitle={l.level}
      >
        <div className="tag-row">
          {l.demo && <Badge>DEMO</Badge>}
          <Badge green={l.status === "published"}>
            {l.status === "published" ? "Publicada" : "Borrador / revisión"}
          </Badge>
        </div>
      </PageHeading>
      <div className="lesson-layout">
        <article className="panel lesson-article">
          <div className="section-heading">
            <div>
              <span className="eyebrow">VERSIÓN {l.version}</span>
              <p>{l.confidence}</p>
            </div>
            <Button variant="secondary" onClick={() => setEditing(!editing)}>
              {editing ? "Cerrar editor" : "Editar y revisar"}
            </Button>
          </div>
          {editing ? (
            <div className="form-stack">
              <label>
                Título
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label>
                Módulo
                <input
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                />
              </label>
              <label>
                Contenido editable
                <textarea
                  rows={20}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={reviewed}
                  onChange={(e) => setReviewed(e.target.checked)}
                />{" "}
                He contrastado las afirmaciones, condiciones y referencias.
              </label>
              <div className="button-row">
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => void save("draft")}
                >
                  Guardar borrador
                </Button>
                <Button
                  disabled={busy || !reviewed}
                  onClick={() => void save("published")}
                >
                  <Check size={16} /> Publicar revisada
                </Button>
                <Button
                  variant="danger"
                  disabled={busy}
                  onClick={() => void save("rejected")}
                >
                  Rechazar
                </Button>
              </div>
            </div>
          ) : (
            <div className="lesson-prose">
              {l.body
                .split(/\n\n/)
                .map((p, i) =>
                  p.length < 100 && !/[.!?]/.test(p) ? (
                    <h3 key={i}>{p}</h3>
                  ) : (
                    <p key={i}>{p}</p>
                  ),
                )}
            </div>
          )}
          <h3>Origen e interpretación</h3>
          {s.concepts
            .filter((c) => l.conceptIds.includes(c.id))
            .map((c) => (
              <div className="concept-note" key={c.id}>
                <Badge>
                  {c.kind === "extracto"
                    ? "Extracto / edición editorial"
                    : "Interpretación de IA · revisable"}
                </Badge>
                <h4>{c.title}</h4>
                <blockquote>{c.quote}</blockquote>
                <p className="micro">
                  {c.conditions.join(" ")} {c.warnings.join(" ")}
                </p>
              </div>
            ))}
          <h3>Referencias originales</h3>
          <SourceLinks s={s} ids={l.segmentIds} />
          {l.revisions?.length ? (
            <details>
              <summary>Historial de versiones ({l.revisions.length})</summary>
              {l.revisions.map((v) => (
                <details key={v.version}>
                  <summary>
                    v{v.version} · {new Date(v.at).toLocaleString("es-ES")}
                  </summary>
                  <h4>{v.title}</h4>
                  <pre>{v.body}</pre>
                </details>
              ))}
            </details>
          ) : null}
        </article>
        <aside className="lesson-aside">
          <section className="panel">
            <h3>Qué trabajarás</h3>
            <ul>
              {l.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
            <h4>Antes de esta lección</h4>
            <ul>
              {l.prerequisites.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="micro">
              Revisión:{" "}
              {l.reviewedAt
                ? new Date(l.reviewedAt).toLocaleDateString("es-ES")
                : "Pendiente"}
            </p>
            <div className="divider" />
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() =>
                void act({
                  op: "progress",
                  lessonId: l.id,
                  completed: !progress?.completed,
                  favorite: progress?.favorite ?? false,
                  notes,
                })
              }
            >
              <Check size={15} />
              {progress?.completed ? "Marcar pendiente" : "Completar lectura"}
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() =>
                void act({
                  op: "progress",
                  lessonId: l.id,
                  completed: progress?.completed ?? false,
                  favorite: !progress?.favorite,
                  notes,
                })
              }
            >
              <Heart size={15} />
              {progress?.favorite ? "Quitar favorito" : "Guardar favorito"}
            </Button>
            <p className="micro">
              Completar la lectura no demuestra dominio estratégico.
            </p>
          </section>
          <section className="panel">
            <h3>Aplicar y recordar</h3>
            <p className="muted">
              Genera preguntas de recuperación y flashcards con fuentes.
            </p>
            <Button
              disabled={busy || l.status !== "published"}
              onClick={async () => {
                const r = await act({ op: "practice", lessonId: l.id });
                if (r)
                  notify("Práctica conectada a las referencias de la lección.");
              }}
            >
              <Sparkles size={15} /> Preparar práctica
            </Button>
            <Button variant="ghost" onClick={() => ctx.navigate("trainer")}>
              Abrir entrenador <ArrowRight size={14} />
            </Button>
          </section>
          <section className="panel">
            <label>
              Mis notas
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={7}
                placeholder="Qué cambia en mi próxima revisión de manos…"
              />
            </label>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={async () => {
                if (
                  await act({
                    op: "progress",
                    lessonId: l.id,
                    completed: progress?.completed ?? false,
                    favorite: progress?.favorite ?? false,
                    notes,
                  })
                )
                  notify("Notas guardadas.");
              }}
            >
              Guardar notas
            </Button>
          </section>
        </aside>
      </div>
    </>
  );
}

export function SearchPage({ s, notify }: Context) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Segment[]>();
  const [busy, setBusy] = useState(false);
  async function search() {
    setBusy(true);
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setResults(d.segments);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Error en búsqueda.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="PREGUNTA A TUS FUENTES"
        title="Buscar conocimiento"
        subtitle="Consulta fragmentos reales. Distingue la voz de la fuente de las interpretaciones guardadas."
      />
      <form
        className="panel global-search"
        onSubmit={(e) => {
          e.preventDefault();
          void search();
        }}
      >
        <Search size={24} />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="¿Cómo planificar el second barrel en turn?"
          aria-label="Consulta de conocimiento"
          maxLength={500}
        />
        <Button disabled={busy || q.trim().length < 2}>
          {busy ? "Buscando…" : "Buscar"} <ArrowRight size={15} />
        </Button>
      </form>
      <div className="suggestions">
        {["second barrel turn", "BTN BB boards bajos", "bluffcatch river"].map(
          (v) => (
            <button key={v} onClick={() => setQ(v)}>
              {v}
            </button>
          ),
        )}
      </div>
      <div className="notice">
        {s.capabilities.mode === "supabase"
          ? "Búsqueda full-text PostgreSQL en español."
          : "Búsqueda léxica local de fragmentos."}{" "}
        Las coincidencias no bastan para afirmar una respuesta. No se genera una
        síntesis sin validar sus fuentes.
      </div>
      {results?.length ? (
        results.map((g) => {
          const cs = s.concepts.filter((c) => c.segmentIds.includes(g.id));
          return (
            <article className="panel search-result" key={g.id}>
              <div className="tag-row">
                <Badge green>Fragmento recuperado</Badge>
                <span className="micro">Referencia original</span>
              </div>
              <p className="source-excerpt">
                {g.text.slice(0, 1600)}
                {g.text.length > 1600 ? "…" : ""}
              </p>
              {cs.slice(0, 3).map((c) => (
                <div className="search-interpretation" key={c.id}>
                  <Badge>
                    {c.kind === "interpretación IA"
                      ? "Interpretación de IA"
                      : "Lectura editorial / extracto"}
                  </Badge>
                  <h3>{c.title}</h3>
                  <p>{c.explanation.slice(0, 900)}</p>
                  <p className="micro">{c.warnings.join(" ")}</p>
                </div>
              ))}
              <SourceLinks s={s} ids={[g.id]} />
            </article>
          );
        })
      ) : results ? (
        <Empty title="Las fuentes disponibles no permiten responder">
          <p>
            No se encontraron fragmentos pertinentes. Importa más material o
            prueba términos relacionados. No se inventará una respuesta del
            canal.
          </p>
        </Empty>
      ) : (
        <Empty title="El conocimiento que buscas está en tus fuentes">
          <p>
            Busca decisiones, texturas, posiciones o ajustes. Los ejemplos DEMO
            también aparecerán claramente identificados.
          </p>
        </Empty>
      )}
    </>
  );
}

export function Trainer(ctx: Context) {
  const { s, act, busy } = ctx;
  const [mode, setMode] = useState<"practice" | "review">("practice");
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number>();
  const [feedback, setFeedback] = useState(false);
  const published = s.exercises.filter(
    (e) =>
      !e.demo &&
      s.lessons.some((l) => l.id === e.lessonId && l.status === "published"),
  );
  const ready = published.filter((exercise) => exercise.kind !== "pendiente");
  const pending = published.filter((exercise) => exercise.kind === "pendiente");
  const exercises = mode === "practice" ? ready : pending;
  const e = exercises[index % Math.max(1, exercises.length)];
  function switchMode(next: "practice" | "review") {
    setMode(next);
    setIndex(0);
    setChoice(undefined);
    setFeedback(false);
  }
  function nextExercise() {
    setIndex(index + 1);
    setChoice(undefined);
    setFeedback(false);
  }
  async function answer() {
    if (choice === undefined || !e) return;
    const r = await act({ op: "attempt", exerciseId: e.id, choice });
    if (r) setFeedback(true);
  }
  return (
    <>
      <PageHeading
        eyebrow="PENSAR ANTES DE ACTUAR"
        title="Entrenador de decisiones"
        subtitle="Práctica fuera de sesión. Respuestas condicionadas a la fuente y a los supuestos."
      />
      <div className="button-row" aria-label="Modo del entrenador">
        <Button
          variant={mode === "practice" ? "primary" : "secondary"}
          aria-pressed={mode === "practice"}
          disabled={busy}
          onClick={() => switchMode("practice")}
        >
          Practicar ({ready.length})
        </Button>
        <Button
          variant={mode === "review" ? "primary" : "secondary"}
          aria-pressed={mode === "review"}
          disabled={busy}
          onClick={() => switchMode("review")}
        >
          Revisar pendientes ({pending.length})
        </Button>
      </div>
      {e ? (
        <div className="trainer-layout">
          <section className="panel exercise-card">
            <div className="section-heading">
              <div className="tag-row">
                <Badge green>{e.difficulty}</Badge>
                <Badge>{e.kind}</Badge>
                {e.demo && <Badge>DEMO</Badge>}
              </div>
              <small className="muted">
                {(index % exercises.length) + 1} de {exercises.length}
              </small>
            </div>
            <h2>{e.prompt}</h2>
            {e.hand && (
              <HandTable hand={{ ...e.hand, id: e.id, createdAt: "" }} />
            )}
            <div className="exercise-options">
              {e.options.map((o, i) => (
                <button
                  disabled={feedback || busy || e.kind === "pendiente"}
                  key={o}
                  className={`exercise-option ${choice === i ? "chosen" : ""} ${feedback && e.accepted.includes(i) ? "correct" : ""}`}
                  onClick={() => setChoice(i)}
                >
                  <span>{String.fromCharCode(65 + i)}</span>
                  {o}
                  {feedback && e.accepted.includes(i) && <Check size={17} />}
                </button>
              ))}
            </div>
            {feedback ? (
              <div className="feedback">
                <Badge green={e.accepted.includes(choice!)}>
                  {e.accepted.includes(choice!)
                    ? "Respuesta aceptada"
                    : "Revisa el razonamiento"}
                </Badge>
                <h3>El porqué de la decisión</h3>
                <p>{e.explanation}</p>
                <p className="micro">
                  Sin EV, frecuencias ni equities de solver.
                </p>
                <Button onClick={nextExercise}>
                  Siguiente ejercicio <ArrowRight size={15} />
                </Button>
              </div>
            ) : (
              <div className="button-row">
                {mode === "practice" && (
                  <Button
                    disabled={
                      busy || choice === undefined || e.kind === "pendiente"
                    }
                    onClick={() => void answer()}
                  >
                    Guardar mi respuesta <ArrowRight size={15} />
                  </Button>
                )}
                <Button
                  variant="secondary"
                  disabled={busy || exercises.length < 2}
                  onClick={nextExercise}
                >
                  {mode === "review"
                    ? "Siguiente pendiente"
                    : "Saltar ejercicio"}
                </Button>
              </div>
            )}
          </section>
          <aside className="panel trainer-aside">
            <Target size={24} className="accent" />
            <h3>Supuestos del ejercicio</h3>
            <ul>
              {e.assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <h3>Material relacionado</h3>
            <p>{s.lessons.find((l) => l.id === e.lessonId)?.title}</p>
            <Button variant="ghost" onClick={() => ctx.navigate("academy")}>
              Revisar lección <ArrowRight size={14} />
            </Button>
            {(feedback || e.kind === "pendiente") && (
              <SourceLinks s={s} ids={e.segmentIds} />
            )}
            {e.kind === "pendiente" && (
              <div className="notice">
                <strong>Ejercicio pendiente de revisión</strong>
                <p>
                  Respuesta sugerida:{" "}
                  {e.accepted.map((i) => e.options[i]).join(" / ")}
                </p>
                <p>{e.explanation}</p>
                <Button
                  disabled={busy}
                  variant="secondary"
                  onClick={async () => {
                    if (await act({ op: "exerciseReview", exerciseId: e.id }))
                      switchMode("practice");
                  }}
                >
                  He revisado este ejercicio
                </Button>
              </div>
            )}
            <div className="divider" />
            <p className="micro">
              {s.attempts.filter((a) => a.exerciseId === e.id).length} intentos
              guardados. Un error puntual es una señal de repaso, no un leak
              demostrado.
            </p>
          </aside>
        </div>
      ) : (
        <Empty
          title={
            mode === "review"
              ? "No quedan ejercicios pendientes de revisión"
              : "No hay test listos para practicar"
          }
        >
          <p>
            {mode === "review"
              ? "Vuelve a Practicar para responder los test disponibles."
              : pending.length
                ? "Abre Revisar pendientes para contrastar sus fuentes y habilitar esos ejercicios."
                : "Publica una lección y prepara su práctica para añadir ejercicios."}
          </p>
        </Empty>
      )}
    </>
  );
}

export function ReviewPage({ s, act, busy }: Context) {
  const [shown, setShown] = useState(false);
  const schedules = s.reviews.filter((r) =>
    s.cards.some((c) => c.id === r.cardId && !c.demo),
  );
  const due = schedules.filter((r) => Date.parse(r.due) <= s.capabilities.now);
  const review = due[0];
  const card = s.cards.find((c) => c.id === review?.cardId);
  return (
    <>
      <PageHeading
        eyebrow="RECUPERAR, NO SOLO RELEER"
        title="Repaso inteligente"
        subtitle="SM-2: los intervalos se adaptan a tu autoevaluación. Leer no equivale a recordar."
      />
      {card ? (
        <section className="panel flashcard">
          <div className="tag-row">
            <Badge green>{due.length} pendientes</Badge>
            {card.demo && <Badge>DEMO</Badge>}
            <Badge>{review.repetitions} repeticiones satisfactorias</Badge>
          </div>
          <span className="eyebrow">PIENSA TU RESPUESTA</span>
          <h2>{card.front}</h2>
          {shown ? (
            <>
              <div className="card-answer">{card.back}</div>
              <SourceLinks s={s} ids={card.segmentIds} />
              <h3>¿Cómo la has recuperado?</h3>
              <div className="button-row">
                {[
                  [1, "No la recordaba"],
                  [3, "Con dificultad"],
                  [4, "Bien"],
                  [5, "Con claridad"],
                ].map(([grade, label]) => (
                  <Button
                    key={grade}
                    variant="secondary"
                    disabled={busy}
                    onClick={async () => {
                      if (await act({ op: "review", cardId: card.id, grade }))
                        setShown(false);
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <Button onClick={() => setShown(true)}>Ver respuesta</Button>
          )}
        </section>
      ) : (
        <Empty title="No tienes repasos pendientes">
          <p>
            {s.cards.length
              ? "Tu próxima ficha aparecerá cuando venza su intervalo."
              : "Prepara práctica desde una lección publicada para crear flashcards."}
          </p>
        </Empty>
      )}
      <section className="panel review-schedule">
        <details>
          <summary>Ver plan de repaso</summary>
          {schedules.map((r) => (
            <div className="schedule-row" key={r.id}>
              <span>{s.cards.find((c) => c.id === r.cardId)?.front}</span>
              <span>
                {new Date(r.due).toLocaleDateString("es-ES")} · {r.interval}{" "}
                días
              </span>
              <Badge>
                {r.lastGrade === undefined
                  ? "Nueva"
                  : r.lastGrade < 3
                    ? "Difícil"
                    : "En revisión"}
              </Badge>
            </div>
          ))}
        </details>
      </section>
    </>
  );
}

const handTemplate = {
  title: "Mi mano para revisar",
  stakes: "NL2",
  heroPosition: "BTN",
  villainPosition: "BB",
  stack: 100,
  pot: 5.5,
  hero: ["As", "Qh"],
  board: ["Kd", "7c", "2s"],
  street: "flop",
  actions: [
    { street: "preflop", position: "BTN", action: "bet", size: 2.5 },
    { street: "preflop", position: "BB", action: "call", size: 1.5 },
    { street: "flop", position: "BB", action: "check" },
  ],
  notes: "SB 0,5 BB foldea. BB inicial 1 BB. Sin reads.",
  reasoning: "",
  question: "¿Qué objetivo tendría una c-bet con esta combinación?",
  tags: [],
  demo: false,
};
export function HandsPage(ctx: Context) {
  const { s, act, busy, notify } = ctx;
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState(false);
  const [text, setText] = useState(JSON.stringify(handTemplate, null, 2));
  const hand = s.hands.find((h) => h.id === selected);
  const filtered = s.hands.filter((h) =>
    `${h.title} ${h.question} ${h.tags.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  async function save() {
    try {
      const parsed = JSON.parse(text);
      const r = await act({ op: "hand", hand: parsed });
      if (r) {
        setEditor(false);
        notify("Mano validada y guardada.");
      }
    } catch {
      notify("El JSON no es válido.");
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="TU CUADERNO DE DECISIONES"
        title="Mis manos"
        subtitle="Guarda la línea y el razonamiento antes de conocer el resultado."
      >
        <Button
          onClick={() => {
            setText(JSON.stringify(handTemplate, null, 2));
            setEditor(true);
          }}
        >
          <Plus size={15} /> Registrar mano
        </Button>
      </PageHeading>
      <label className="search-field">
        <Search size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar manos, dudas o etiquetas"
          aria-label="Buscar manos"
        />
      </label>
      <Dialog.Root open={editor} onOpenChange={setEditor}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            <Dialog.Title>Editor e importador de manos</Dialog.Title>
            <Dialog.Description>
              Tamaños = BB añadidas al bote; stack = stack inicial. No se
              admiten side pots ni un parser de historiales de salas en esta
              versión.
            </Dialog.Description>
            <HandEditor value={text} onChange={setText} />
            <details>
              <summary>Importar JSON propio / formato avanzado</summary>
              <label>
                Archivo JSON propio
                <input
                  type="file"
                  accept=".json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 500000) {
                      notify("Máximo 500 KB.");
                      return;
                    }
                    setText(await file.text());
                  }}
                />
              </label>
              <label>
                Datos de la mano
                <textarea
                  rows={18}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  spellCheck={false}
                  className="code-editor"
                />
              </label>
            </details>
            <div className="button-row">
              <Button disabled={busy} onClick={() => void save()}>
                Validar y guardar
              </Button>
              <Dialog.Close asChild>
                <Button variant="secondary">Cancelar</Button>
              </Dialog.Close>
            </div>
            <Dialog.Close className="dialog-close" aria-label="Cerrar editor">
              <X size={20} />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div className="hands-layout">
        <section className="panel hand-list">
          {filtered.length ? (
            filtered.map((h) => (
              <button
                className={`lesson-row ${selected === h.id ? "selected" : ""}`}
                key={h.id}
                onClick={() => setSelected(h.id)}
              >
                <span className="lesson-number">
                  <LayersIcon />
                </span>
                <span>
                  <strong>{h.title}</strong>
                  <small>
                    {h.stakes} · {h.heroPosition} vs {h.villainPosition}
                    {h.demo ? " · DEMO" : ""}
                  </small>
                </span>
                <ChevronRight size={16} />
              </button>
            ))
          ) : (
            <p className="muted">No hay manos para este filtro.</p>
          )}
        </section>
        {hand ? (
          <section className="panel hand-detail">
            <div className="section-heading">
              <h2>{hand.title}</h2>
              <Button
                variant="secondary"
                onClick={() => {
                  setText(JSON.stringify(hand, null, 2));
                  setEditor(true);
                }}
              >
                Editar
              </Button>
            </div>
            <HandTable hand={hand} />
            <h3>Acciones registradas</h3>
            <div className="action-history">
              {hand.actions.map((a, i) => (
                <div key={i}>
                  <Badge>{a.street}</Badge>
                  <span>{a.position}</span>
                  <strong>
                    {a.action}{" "}
                    {a.size !== undefined ? `${a.size} BB añadidas` : ""}
                  </strong>
                </div>
              ))}
            </div>
            <h3>Mi razonamiento</h3>
            <p>{hand.reasoning || "Sin razonamiento registrado."}</p>
            <h3>La duda que quiero resolver</h3>
            <p>{hand.question || "Sin duda registrada."}</p>
            <h3>Contexto y rival</h3>
            <p>{hand.notes || "Sin notas."}</p>
            <div className="tag-row">
              {hand.tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
            <Button variant="ghost" onClick={() => ctx.navigate("leaks")}>
              Relacionar evidencia en Mis leaks <ArrowRight size={14} />
            </Button>
          </section>
        ) : (
          <Empty title="Una mano, una pregunta útil">
            <p>
              Selecciona una mano para revisar su contexto o registra una nueva.
            </p>
          </Empty>
        )}
      </div>
    </>
  );
}
function LayersIcon() {
  return <BookOpen size={18} />;
}

export function LeaksPage({ s, act, busy, notify }: Context) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [severity, setSeverity] = useState("media");
  const [evidence, setEvidence] = useState<string[]>([]);
  const [lessons, setLessons] = useState<string[]>([]);
  const [uncertainty, setUncertainty] = useState("Alta: hipótesis por revisar");
  return (
    <>
      <PageHeading
        eyebrow="EVIDENCIA ANTES QUE ETIQUETAS"
        title="Mis leaks"
        subtitle="Organiza hipótesis de mejora. Un fallo aislado no demuestra una tendencia estadística."
      />
      <section className="panel leak-form">
        <h2>Registrar una hipótesis</h2>
        <div className="two-cols">
          <div>
            <label>
              Área o patrón
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Planificación de turn y river"
              />
            </label>
            <label>
              Observaciones
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </label>
            <div className="two-cols">
              <label>
                Severidad
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </label>
              <label>
                Incertidumbre
                <input
                  value={uncertainty}
                  onChange={(e) => setUncertainty(e.target.value)}
                />
              </label>
            </div>
          </div>
          <div>
            <label>
              Evidencia: manos e intentos
              <select
                multiple
                size={5}
                value={evidence}
                onChange={(e) =>
                  setEvidence(
                    Array.from(e.target.selectedOptions).map((o) => o.value),
                  )
                }
              >
                {s.hands.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.title}
                  </option>
                ))}
                {s.attempts
                  .filter((a) => !a.correct)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      Error:{" "}
                      {s.exercises
                        .find((e) => e.id === a.exerciseId)
                        ?.prompt.slice(0, 80)}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Lecciones para trabajar
              <select
                multiple
                value={lessons}
                onChange={(e) =>
                  setLessons(
                    Array.from(e.target.selectedOptions).map((o) => o.value),
                  )
                }
              >
                {s.lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </label>
            <p className="micro">
              Ctrl / Cmd para selección múltiple. Sin evidencia, se conserva
              como observación manual.
            </p>
          </div>
        </div>
        <Button
          disabled={busy || title.length < 3}
          onClick={async () => {
            if (
              await act({
                op: "leak",
                title,
                notes,
                severity,
                uncertainty,
                worked: false,
                evidenceIds: evidence,
                lessonIds: lessons,
              })
            ) {
              setTitle("");
              setNotes("");
              setEvidence([]);
              setLessons([]);
              notify("Hipótesis guardada con su incertidumbre.");
            }
          }}
        >
          Guardar hipótesis
        </Button>
      </section>
      <div className="leak-grid">
        {s.leaks.map((l) => (
          <section className="panel leak-card" key={l.id}>
            <div className="tag-row">
              <Badge green={l.worked}>
                {l.worked ? "Trabajado" : "Abierto"}
              </Badge>
              <Badge>Severidad {l.severity}</Badge>
              {l.demo && <Badge>DEMO</Badge>}
            </div>
            <h3>{l.title}</h3>
            <p>{l.notes}</p>
            <p className="micro">Incertidumbre: {l.uncertainty}</p>
            <p>
              {l.evidenceIds.length} evidencias · {l.lessonIds.length} lecciones
              relacionadas
            </p>
            <details>
              <summary>Historial y evidencia</summary>
              {l.evidenceIds.map((id) => (
                <p key={id}>
                  {s.hands.find((h) => h.id === id)?.title ?? `Intento ${id}`}
                </p>
              ))}
              {l.history.map((h, i) => (
                <p key={i} className="micro">
                  {h}
                </p>
              ))}
            </details>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => void act({ op: "leak", ...l, worked: !l.worked })}
            >
              {l.worked ? "Volver a abrir" : "Marcar trabajado"}
            </Button>
          </section>
        ))}
      </div>
    </>
  );
}

export function SettingsPage({ s, act, busy, notify }: Context) {
  const [settings, setSettings] = useState(s.settings);
  return (
    <>
      <PageHeading
        eyebrow="TU ACADEMIA, A TU MANERA"
        title="Ajustes"
        subtitle="Preferencias, proveedores, privacidad y portabilidad de tus datos."
      />
      <div className="settings-grid">
        <section className="panel">
          <h2>Perfil de estudio</h2>
          <label>
            Nombre de academia
            <input
              value={settings.name}
              onChange={(e) =>
                setSettings({ ...settings, name: e.target.value })
              }
            />
          </label>
          <div className="two-cols">
            <label>
              Stakes
              <select
                value={settings.stakes}
                onChange={(e) =>
                  setSettings({ ...settings, stakes: e.target.value })
                }
              >
                {["NL2", "NL5", "NL10"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              Formato
              <select
                value={settings.format}
                onChange={(e) =>
                  setSettings({ ...settings, format: e.target.value })
                }
              >
                {["Cash 6-max", "Cash heads-up", "Cash full-ring"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Nivel y siguiente objetivo
            <input
              value={settings.level}
              onChange={(e) =>
                setSettings({ ...settings, level: e.target.value })
              }
            />
          </label>
          <label>
            Objetivos de estudio
            <textarea
              value={settings.goals}
              onChange={(e) =>
                setSettings({ ...settings, goals: e.target.value })
              }
              rows={3}
            />
          </label>
          <label>
            Canal de origen
            <input
              value={settings.channel}
              onChange={(e) =>
                setSettings({ ...settings, channel: e.target.value })
              }
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={settings.stopJobs}
              onChange={(e) =>
                setSettings({ ...settings, stopJobs: e.target.checked })
              }
            />{" "}
            Detener nuevas llamadas y trabajos tras el checkpoint actual.
          </label>
          <Button
            disabled={busy}
            onClick={async () => {
              if (await act({ op: "settings", ...settings }))
                notify("Preferencias guardadas.");
            }}
          >
            Guardar ajustes
          </Button>
        </section>
        <div className="settings-right">
          <section className="panel">
            <div className="section-heading">
              <h2>Servicios y APIs</h2>
              <ShieldCheck className="accent" size={20} />
            </div>
            <div className="service-row">
              <span>Base de datos</span>
              <Badge green>{s.capabilities.storage}</Badge>
            </div>
            <div className="service-row">
              <span>YouTube Data API</span>
              <Badge green={s.capabilities.youtube}>
                {s.capabilities.youtube
                  ? "Clave configurada"
                  : "Sin configurar"}
              </Badge>
            </div>
            <div className="service-row">
              <span>Modelo IA</span>
              <Badge green={s.capabilities.ai}>{s.capabilities.model}</Badge>
            </div>
            <p className="micro">
              «Configurada» indica presencia de credenciales; no verifica
              conexión ni cuota.
            </p>
            <p className="muted">
              Añade claves en <code>.env.local</code> o en las variables de
              Vercel. Reinicia el proceso después de cambiarlas. Las claves
              permanecen en servidor.
            </p>
            <details>
              <summary>Variables de configuración</summary>
              <pre>
                YOUTUBE_API_KEY{`\n`}AI_API_KEY{`\n`}AI_BASE_URL{`\n`}AI_MODEL
                {`\n`}AI_INPUT_USD_PER_MILLION{`\n`}AI_OUTPUT_USD_PER_MILLION
              </pre>
              <p>
                Introduce precios vigentes del proveedor en USD por millón. La
                estimación usa límites de salida y una reserva conservadora de
                entrada.
              </p>
            </details>
          </section>
          <section className="panel">
            <h2>Datos y copias de seguridad</h2>
            <p className="muted">
              Exportaciones privadas. El JSON incluye fuentes, materiales,
              progreso, manos, leaks y consumo; nunca credenciales.
            </p>
            <div className="button-row">
              <a href="/api/export" className="button button-secondary">
                <ArrowDownToLine size={15} /> Exportar JSON
              </a>
              <a
                href="/api/export?format=markdown"
                className="button button-secondary"
              >
                Apuntes Markdown
              </a>
            </div>
            <p className="micro">
              La restauración integral de JSON aún no está implementada. Para
              respaldo restaurable local, copia SQLite con el servidor y el
              worker detenidos; en producción usa backups de Supabase.
            </p>
          </section>
          <section className="panel">
            <h2>Laboratorio DEMO</h2>
            <p className="muted">
              3 lecciones, 5 ejercicios, una mano y una hipótesis de leak.
              Material ficticio identificado, sin citas del canal real.
            </p>
            <Button
              variant="secondary"
              disabled={busy || s.videos.some((v) => v.id === "demo_video")}
              onClick={async () => {
                if (await act({ op: "seed" }))
                  notify("Demo añadido sin sobrescribir tus datos.");
              }}
            >
              <Sparkles size={16} />{" "}
              {s.videos.some((v) => v.id === "demo_video")
                ? "Demo ya cargado"
                : "Cargar ejemplos"}
            </Button>
          </section>
        </div>
      </div>
    </>
  );
}
