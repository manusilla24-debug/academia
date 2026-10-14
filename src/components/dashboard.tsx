"use client";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  RotateCcw,
  Target,
} from "lucide-react";
import { Badge, type Context } from "./lab";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
export function Dashboard({ s, navigate }: Context) {
  const published = s.lessons.filter(
    (l) => l.status === "published" && !l.demo,
  );
  const available = published.length
    ? published
    : s.lessons.filter((l) => l.status === "published");
  const recent = [...s.progress]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .find((p) => !p.completed);
  const next =
    available.find((l) => l.id === recent?.lessonId) ??
    available.find(
      (l) => !s.progress.find((p) => p.lessonId === l.id)?.completed,
    ) ??
    available[0];
  const done = published.filter(
    (l) => s.progress.find((p) => p.lessonId === l.id)?.completed,
  ).length;
  const due = s.reviews.filter(
    (r) =>
      Date.parse(r.due) <= s.capabilities.now &&
      s.cards.some((c) => c.id === r.cardId && !c.demo),
  ).length;
  const source = s.videos.find((v) => v.id === next?.videoId);
  const following = available
    .filter(
      (l) =>
        l.id !== next?.id &&
        !s.progress.find((p) => p.lessonId === l.id)?.completed,
    )
    .slice(0, 3);
  return (
    <div className="quiet-home">
      <div className="quiet-heading">
        <span className="eyebrow">MI ESTUDIO</span>
        <h1>Una buena decisión cada vez.</h1>
        <p>Continúa donde lo dejaste.</p>
      </div>
      <Card className="focus-lesson">
        <CardHeader>
          <div className="focus-label">
            <BookOpen size={16} />
            <span>Siguiente lección</span>
            {next?.demo && <Badge>DEMO</Badge>}
          </div>
          <CardTitle>
            {next?.title ?? "Tu academia comienza con una fuente."}
          </CardTitle>
          <CardDescription>
            {next
              ? next.module
              : "Añade un vídeo y su transcripción para preparar tu primera lección."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            {next?.objectives[0] ??
              "Organiza contenido que puedas contrastar y aplicar."}
          </p>
          <div className="focus-source">
            {source?.sourceType === "editorial"
              ? "Guía editorial propia"
              : next?.demo
                ? "Ejemplo de demostración"
                : source?.url
                  ? "Contenido con fuente original"
                  : "Espacio personal"}
            {next && (
              <span>
                {" "}
                · {Math.max(
                  1,
                  Math.ceil(next.body.split(/\s+/).length / 180),
                )}{" "}
                min de lectura estimada
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => navigate(next ? "academy" : "library", next?.id)}
          >
            {next ? "Continuar lección" : "Añadir una fuente"}
            <ArrowRight size={16} />
          </Button>
          <button className="text-button" onClick={() => navigate("academy")}>
            Ver temario
          </button>
        </CardFooter>
      </Card>
      <div className="quiet-actions">
        <button onClick={() => navigate("review")}>
          <RotateCcw size={19} />
          <span>
            <strong>Repasar</strong>
            <small>
              {due
                ? `${due} fichas pendientes`
                : "Recupera lo que has aprendido"}
            </small>
          </span>
          <ChevronRight size={16} />
        </button>
        <button onClick={() => navigate("trainer")}>
          <Target size={19} />
          <span>
            <strong>Practicar</strong>
            <small>Explica tu próxima decisión</small>
          </span>
          <ChevronRight size={16} />
        </button>
      </div>
      {following.length > 0 && (
        <section className="up-next">
          <div className="section-heading">
            <h2>Después de esta lección</h2>
            <span>
              {done} de {published.length} lecturas completadas
            </span>
          </div>
          {following.map((l, i) => (
            <button
              className="next-lesson"
              key={l.id}
              onClick={() => navigate("academy", l.id)}
            >
              <span>{String(i + 2).padStart(2, "0")}</span>
              <div>
                <strong>{l.title}</strong>
                <small>{l.module}</small>
              </div>
              <ChevronRight size={16} />
            </button>
          ))}
        </section>
      )}
      <details className="quiet-activity">
        <summary>Ver actividad y estado de las fuentes</summary>
        <div className="quiet-metrics">
          <span>
            <Check size={14} />
            {s.attempts.length} respuestas guardadas
          </span>
          <span>{s.hands.length} manos registradas</span>
          <span>
            {s.videos.filter((v) => v.youtubeId).length} vídeos en biblioteca
          </span>
          <span>
            {s.lessons.filter((l) => l.status === "draft").length} borradores
            por revisar
          </span>
        </div>
        <button className="text-button" onClick={() => navigate("library")}>
          Gestionar fuentes <ArrowRight size={13} />
        </button>
      </details>
    </div>
  );
}
