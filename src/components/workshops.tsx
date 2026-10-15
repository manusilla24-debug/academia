"use client";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ExternalLink,
  Play,
  Search,
} from "lucide-react";
import { Badge, Empty, PageHeading, type Context } from "./lab";
import { Button } from "./ui/button";

export function Workshops({ s, navigate }: Context) {
  const [query, setQuery] = useState("");
  const [available, setAvailable] = useState(false);
  const [limit, setLimit] = useState(9);
  const videos = s.videos
    .filter(
      (v) =>
        v.youtubeId &&
        !v.demo &&
        v.relevant &&
        /revisi|manos|masterclass|dragón|dragon|live|sesión|sesion|pensamiento/i.test(
          v.title,
        ),
    )
    .sort(
      (a, b) =>
        Number(s.transcripts.some((t) => t.videoId === b.id)) -
          Number(s.transcripts.some((t) => t.videoId === a.id)) ||
        (b.duration ?? 0) - (a.duration ?? 0),
    );
  const list = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(query.toLowerCase()) &&
      (!available ||
        s.lessons.some(
          (l) => l.videoId === v.id && l.status === "published" && !l.demo,
        )),
  );
  const transcripts = videos.filter((v) =>
    s.transcripts.some((t) => t.videoId === v.id),
  );
  return (
    <>
      <PageHeading
        eyebrow="EL LABORATORIO DE LA ACADEMIA"
        title="Aprende dentro de la mano."
        subtitle="Las revisiones largas son el lugar para conectar la teoría con decisiones reales."
      />
      <section className="workshop-hero">
        <div>
          <span className="pill-label">PAUSA · DECIDE · COMPARA</span>
          <h2>
            Ver la respuesta es fácil.
            <br />
            Aprende a llegar hasta ella.
          </h2>
          <p>
            Elige un concepto, detén el vídeo antes de la decisión y escribe tu
            plan. Después compara el razonamiento y llévalo a una mano propia.
          </p>
          <Button
            onClick={() => navigate("academy", "academy_estudiar-revisiones")}
          >
            Cómo estudiar una sesión larga
            <ArrowRight size={16} />
          </Button>
        </div>
        <div className="workshop-diagram" aria-hidden="true">
          <span>
            01<span>Tu decisión</span>
          </span>
          <span>
            02<span>El razonamiento</span>
          </span>
          <span>
            03<span>Tu propia mano</span>
          </span>
        </div>
      </section>
      <div className="workshop-stats">
        <span>
          <strong>{videos.length}</strong> sesiones en el catálogo
        </span>
        <span>
          <strong>{transcripts.length}</strong> con fragmentos transcritos
        </span>
        <span>
          <strong>
            {
              s.lessons.filter(
                (l) =>
                  !l.demo &&
                  l.status === "published" &&
                  videos.some((v) => v.id === l.videoId),
              ).length
            }
          </strong>{" "}
          clases desarrolladas
        </span>
      </div>
      <div className="catalog-toolbar">
        <label className="catalog-search">
          <Search size={18} />
          <input
            aria-label="Buscar revisiones"
            placeholder="Busca una sesión, nivel o programa…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(9);
            }}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => {
              setAvailable(e.target.checked);
              setLimit(9);
            }}
          />
          Con clases disponibles
        </label>
      </div>
      <div className="workshop-grid">
        {list.slice(0, limit).map((v) => {
          const classes = s.lessons.filter(
            (l) => l.videoId === v.id && l.status === "published" && !l.demo,
          );
          const transcript = s.transcripts.some((t) => t.videoId === v.id);
          return (
            <article className="panel workshop-card" key={v.id}>
              <div className="workshop-cover">
                <span className="workshop-suit" aria-hidden="true">
                  ♠
                </span>
                <Play size={30} />
                <span className="workshop-cover-label">
                  REVISIÓN & ESTRATEGIA
                </span>
                {v.duration && (
                  <small>
                    {Math.floor(v.duration / 3600)
                      ? `${Math.floor(v.duration / 3600)} h `
                      : ""}
                    {Math.floor(v.duration / 60) % 60} min
                  </small>
                )}
              </div>
              <div className="workshop-card-content">
                <Badge green={classes.length > 0}>
                  {classes.length
                    ? `${classes.length} clases disponibles`
                    : transcript
                      ? "Fragmentos disponibles · clases pendientes"
                      : "Pendiente de transcripción"}
                </Badge>
                <h2>{v.title}</h2>
                {classes.length ? (
                  <div className="workshop-classes">
                    {classes.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => navigate("academy", l.id)}
                      >
                        <BookOpen size={14} />
                        <span>{l.title}</span>
                        <ArrowRight size={14} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p>
                    Usa la pauta de estudio mientras ves la sesión. Las clases
                    aparecerán cuando su contenido esté trabajado.
                  </p>
                )}
                <a
                  href={
                    v.url ?? `https://www.youtube.com/watch?v=${v.youtubeId}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver sesión original
                  <ExternalLink size={13} />
                </a>
              </div>
            </article>
          );
        })}
      </div>
      {list.length > limit && (
        <div className="workshop-more">
          <Button variant="secondary" onClick={() => setLimit((n) => n + 9)}>
            Mostrar más sesiones ({list.length - limit} restantes)
            <ArrowRight size={15} />
          </Button>
        </div>
      )}
      {!list.length && (
        <Empty title="No hay sesiones con estos filtros">
          <button
            className="text-button"
            onClick={() => {
              setQuery("");
              setAvailable(false);
            }}
          >
            Ver todas las sesiones
          </button>
        </Empty>
      )}
      <div className="home-footnote">
        <Check size={14} />
        <span>
          El catálogo y la cobertura son distintos: una sesión guardada no
          significa que todas sus horas estén convertidas en clases.
        </span>
      </div>
    </>
  );
}
