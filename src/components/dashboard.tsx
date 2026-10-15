"use client";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Layers,
  Play,
  RotateCcw,
  Target,
} from "lucide-react";
import { type Context } from "./lab";
import { Button } from "./ui/button";
import {
  learningPaths,
  nextLesson,
  orderedLessons,
  pathFor,
  readingMinutes,
} from "@/lib/learning";

export function Dashboard({ s, navigate }: Context) {
  const lessons = orderedLessons(s);
  const next = nextLesson(s);
  const done = lessons.filter((l) =>
    s.progress.some((p) => p.lessonId === l.id && p.completed),
  ).length;
  const due = s.reviews.filter(
    (r) =>
      Date.parse(r.due) <= s.capabilities.now &&
      s.cards.some((c) => c.id === r.cardId && !c.demo),
  ).length;
  const following = lessons
    .filter(
      (l) =>
        l.id !== next?.id &&
        !s.progress.some((p) => p.lessonId === l.id && p.completed),
    )
    .slice(0, 3);
  return (
    <div className="learning-home">
      <div className="home-heading">
        <div>
          <span className="eyebrow">TU ACADEMIA DE CASH</span>
          <h1>
            El siguiente nivel empieza
            <br />
            por entender el porqué<span className="lime">.</span>
          </h1>
          <p>Una clase, una idea clara y una decisión mejor.</p>
        </div>
        <span className="home-stake">
          <span className="online-dot" />
          {s.settings.stakes} <span>→</span> NL10
        </span>
      </div>
      <div className="home-primary">
        <section className="today-class">
          <div className="today-copy">
            <span className="pill-label">
              <span className="online-dot" /> TU SIGUIENTE CLASE
            </span>
            <h2>{next?.title ?? "Tu recorrido empieza aquí"}</h2>
            <p>
              {next?.objectives[0] ??
                "Añade tus primeras fuentes para construir tu espacio de aprendizaje."}
            </p>
            <div className="lesson-meta">
              <span>
                <Clock3 size={14} />
                {next ? readingMinutes(next) : 0} min de lectura
              </span>
              <span>
                <Target size={14} /> Concepto + práctica
              </span>
            </div>
            <Button
              onClick={() => navigate(next ? "academy" : "library", next?.id)}
            >
              {next ? "Entrar en clase" : "Añadir una fuente"}
              <ArrowRight size={16} />
            </Button>
          </div>
          <div className="hero-cards" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="academy-playing-card card-back">
              <span>
                K<span>♠</span>
              </span>
              <b>♠</b>
            </div>
            <div className="academy-playing-card card-front">
              <span>
                A<span>♠</span>
              </span>
              <b>♠</b>
              <small>PIENSA EN RANGOS</small>
            </div>
            <span className="chip chip-one">+EV</span>
            <span className="hero-caption">
              NO MEMORICES LA JUGADA.
              <br />
              ENTIENDE LA DECISIÓN.
            </span>
          </div>
        </section>
        <aside className="home-progress panel">
          <div className="section-heading">
            <span className="eyebrow">TU RECORRIDO</span>
            <BookOpen size={18} />
          </div>
          <div className="progress-number">
            {done}
            <span> / {lessons.length}</span>
          </div>
          <p>clases completadas</p>
          <progress
            value={done}
            max={Math.max(1, lessons.length)}
            aria-label="Clases completadas"
          />
          <div className="progress-note">
            {done
              ? "Sigue conectando conceptos con tus manos."
              : "El primer paso es construir una base sólida."}
          </div>
          <button className="text-button" onClick={() => navigate("academy")}>
            Explorar el temario
            <ArrowRight size={14} />
          </button>
        </aside>
      </div>
      <div className="daily-tools">
        <button onClick={() => navigate("trainer")}>
          <span className="tool-icon">
            <Target size={20} />
          </span>
          <span>
            <strong>Pon a prueba tu criterio</strong>
            <small>Decide primero. Entiende la respuesta después.</small>
          </span>
          <ArrowRight size={18} />
        </button>
        <button onClick={() => navigate("review")}>
          <span className="tool-icon lavender">
            <RotateCcw size={20} />
          </span>
          <span>
            <strong>Que lo aprendido se quede</strong>
            <small>
              {due
                ? `${due} fichas listas para repasar`
                : "Recupera las ideas de tus clases"}
            </small>
          </span>
          <ArrowRight size={18} />
        </button>
      </div>
      <section className="path-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">DEL CONCEPTO A LA MESA</span>
            <h2>Una ruta con sentido.</h2>
          </div>
          <button className="text-button" onClick={() => navigate("academy")}>
            Ver todo el temario
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="learning-paths">
          {learningPaths.map((p) => {
            const count = lessons.filter((l) => pathFor(l).id === p.id).length;
            return (
              <button
                className={`path-card path-${p.id}`}
                key={p.id}
                onClick={() =>
                  navigate(
                    "academy",
                    lessons.find((l) => pathFor(l).id === p.id)?.id,
                  )
                }
              >
                <span className="path-top">
                  <span>{p.number} / RUTA DE ESTUDIO</span>
                  <ArrowRight size={16} />
                </span>
                <span className="path-art" aria-hidden="true">
                  {p.id === "strategy" ? (
                    "♠"
                  ) : p.id === "preflop" ? (
                    "A K"
                  ) : p.id === "postflop" ? (
                    "♣ ♦ ♠"
                  ) : (
                    <Layers size={48} strokeWidth={1} />
                  )}
                </span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <span className="path-count">
                  {count} clases <ChevronRight size={13} />
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <div className="home-bottom">
        <section className="continue-list">
          <div className="section-heading">
            <h2>Próximas clases</h2>
            <span className="muted">A tu ritmo</span>
          </div>
          {following.map((l, i) => (
            <button
              className="curriculum-row"
              key={l.id}
              onClick={() => navigate("academy", l.id)}
            >
              <span className="lesson-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <strong>{l.title}</strong>
                <small>{l.objectives[0]}</small>
              </span>
              <Clock3 size={14} />
              <small>{readingMinutes(l)} min</small>
              <ChevronRight size={16} />
            </button>
          ))}
          {!following.length && (
            <p>
              Tu siguiente paso: repasar conceptos y aplicarlos a manos propias.
            </p>
          )}
        </section>
        <section className="review-invitation">
          <span className="eyebrow">EL LABORATORIO</span>
          <Play size={26} />
          <h2>
            Las manos enseñan.
            <br />
            Si sabes qué mirar.
          </h2>
          <p>
            Pausa, toma tu decisión y compara el razonamiento. Convierte las
            sesiones largas en aprendizaje.
          </p>
          <button className="text-button" onClick={() => navigate("workshops")}>
            Revisiones de manos
            <ArrowRight size={15} />
          </button>
        </section>
      </div>
      <div className="home-footnote">
        <Check size={14} />
        <span>
          Conceptos, ejemplos y práctica · Tu progreso se guarda en tu academia.
        </span>
      </div>
    </div>
  );
}
