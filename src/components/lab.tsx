"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  BookOpen,
  ChevronRight,
  ExternalLink,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Library,
  LoaderCircle,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Target,
  X,
  LogOut,
  Layers,
  RotateCcw,
} from "lucide-react";
import type { State } from "@/lib/domain";
import { Button } from "./ui/button";
import { Dashboard } from "./dashboard";
import { Workshops } from "./workshops";
import Image from "next/image";
import {
  Academy,
  SearchPage,
  Trainer,
  ReviewPage,
  HandsPage,
  LeaksPage,
  SettingsPage,
} from "./study-pages";
type Nav =
  | "dashboard"
  | "academy"
  | "library"
  | "search"
  | "trainer"
  | "leaks"
  | "hands"
  | "review"
  | "settings"
  | "workshops";
type LabState = State & {
  capabilities: {
    youtube: boolean;
    ai: boolean;
    model: string;
    storage: string;
    mode: string;
    now: number;
  };
};
type Reply = {
  result?: unknown;
  added?: number;
  nextPageToken?: string;
  cost?: number;
  segments?: number;
  inaccessible?: number;
  limited?: boolean;
};
export type Context = {
  s: LabState;
  navigate: (n: Nav, lessonId?: string) => void;
  act: (body: object) => Promise<Reply | undefined>;
  busy: boolean;
  notify: (text: string) => void;
};
const navigation = [
  { id: "dashboard", label: "Mi estudio", icon: LayoutDashboard },
  { id: "academy", label: "Mi academia", icon: GraduationCap },
  { id: "workshops", label: "Revisiones de manos", icon: Layers },
  { id: "library", label: "Biblioteca", icon: Library },
  { id: "search", label: "Buscar conocimiento", icon: Search },
  { id: "trainer", label: "Entrenador", icon: Target },
  { id: "review", label: "Repaso", icon: RotateCcw },
  { id: "hands", label: "Mis manos", icon: Layers },
  { id: "leaks", label: "Mis leaks", icon: Activity },
  { id: "settings", label: "Ajustes", icon: Settings },
] as const;
const statusLabels: Record<string, string> = {
  discovered: "Descubierto",
  metadata_ready: "Metadatos listos",
  transcript_missing: "Falta transcripción",
  transcript_ready: "Fuente lista",
  processing: "Procesando",
  processed: "Procesado",
  needs_review: "Por revisar",
  published: "Publicado",
  failed: "Error",
  queued: "En cola",
  running: "En ejecución",
  paused: "Pausado",
  completed: "Completado",
  draft: "Borrador",
  rejected: "Rechazado",
};
export function Badge({
  children,
  green = false,
}: {
  children: React.ReactNode;
  green?: boolean;
}) {
  return (
    <span className={`badge ${green ? "badge-green" : ""}`}>{children}</span>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty panel">
      <BookOpen size={30} />
      <h3>{title}</h3>
      {children}
    </div>
  );
}
function time(seconds?: number) {
  if (seconds === undefined) return "Sin tiempos";
  return `${Math.floor(seconds / 3600) > 0 ? `${Math.floor(seconds / 3600)}:` : ""}${String(Math.floor(seconds / 60) % 60).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}
export function SourceLinks({ s, ids }: { s: LabState; ids: string[] }) {
  const [full, setFull] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  async function open(id: string) {
    if (full[id]) return;
    try {
      const r = await fetch(`/api/source?id=${encodeURIComponent(id)}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setFull((old) => ({ ...old, [id]: data.segment.text }));
    } catch (e) {
      setErrors((old) => ({
        ...old,
        [id]:
          e instanceof Error ? e.message : "No se pudo recuperar la fuente.",
      }));
    }
  }
  return (
    <div className="sources">
      {ids.map((id) => {
        const g = s.segments.find((g) => g.id === id),
          v = s.videos.find((v) => v.id === g?.videoId);
        if (!g || !v) return null;
        return (
          <details
            key={id}
            onToggle={(e) => {
              if (e.currentTarget.open) void open(id);
            }}
          >
            <summary>
              <FileText size={14} />
              {v.title} <span className="muted">{time(g.start)}</span>
              {v.demo && <Badge>DEMO</Badge>}
              {v.sourceType === "editorial" && (
                <Badge>Guía editorial propia</Badge>
              )}
            </summary>
            <blockquote>
              {full[id] ?? g.text}
              {!full[id] && g.text.length >= 500 ? "…" : ""}
            </blockquote>
            {errors[id] && <p className="error-text">{errors[id]}</p>}
            {v.url && (
              <a
                href={`${v.url}${g.start !== undefined ? `&t=${Math.floor(g.start)}s` : ""}`}
                target="_blank"
                rel="noreferrer"
              >
                Abrir fuente{" "}
                {g.start !== undefined
                  ? `en ${time(g.start)}`
                  : "sin timestamp"}{" "}
                <ExternalLink size={12} />
              </a>
            )}
            <small className="micro">
              Segmento {g.ordinal + 1} · {g.id}
            </small>
          </details>
        );
      })}
    </div>
  );
}
export function Lab() {
  const router = useRouter();
  const [s, setS] = useState<LabState>();
  const [nav, setNav] = useState<Nav>("dashboard");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [loadError, setLoadError] = useState("");
  const [mobile, setMobile] = useState(false);
  const [lessonToOpen, setLessonToOpen] = useState("");
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/lab", { cache: "no-store" });
      if (r.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setS(d);
      setLoadError("");
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "No se pudo conectar.");
    }
  }, [router]);
  useEffect(() => {
    queueMicrotask(() => void load());
    const timer = setInterval(() => void load(), 10000);
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setNav("search");
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", key);
    };
  }, [load]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 7000);
    return () => clearTimeout(timer);
  }, [toast]);
  function navigate(n: Nav, lessonId?: string) {
    setLessonToOpen(lessonId ?? "");
    setNav(n);
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function act(body: object) {
    setBusy(true);
    try {
      const r = await fetch("/api/lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      await load();
      return d as Reply;
    } catch (e) {
      setToast(e instanceof Error ? e.message : "No se pudo completar.");
      return undefined;
    } finally {
      setBusy(false);
    }
  }
  if (!s)
    return (
      <main className="loading-screen">
        {loadError ? (
          <>
            <h2>La biblioteca no está disponible</h2>
            <p role="alert">{loadError}</p>
            <Button onClick={() => void load()}>Reintentar</Button>
          </>
        ) : (
          <>
            <LoaderCircle className="spin" />
            <p>Abriendo tu laboratorio…</p>
          </>
        )}
      </main>
    );
  const ctx: Context = { s, navigate, act, busy, notify: setToast };
  const active = navigation.find((n) => n.id === nav)!;
  const due = s.reviews.filter(
    (r) =>
      Date.parse(r.due) <= s.capabilities.now &&
      s.cards.some((c) => c.id === r.cardId && !c.demo),
  ).length;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <div className="brand">
          <span className="brand-symbol">
            <BookOpen size={21} />
          </span>
          <span>
            {s.settings.name}
            <small>ACADEMIA DE CASH</small>
          </span>
          <button
            className="icon-button mobile-close"
            aria-label="Cerrar menú"
            onClick={() => setMobile(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace-label">
          <span className="online-dot" /> Espacio privado{" "}
          <ShieldCheck size={13} />
        </div>
        <span className="nav-group-label">APRENDER & ENTRENAR</span>
        <nav aria-label="Navegación principal">
          {navigation.map((n) => (
            <button
              key={n.id}
              aria-label={n.label}
              aria-current={nav === n.id ? "page" : undefined}
              className={`nav-item ${nav === n.id ? "active" : ""}`}
              onClick={() => navigate(n.id)}
            >
              <n.icon size={18} />
              <span>{n.label}</span>
              {n.id === "review" && due > 0 && <small>{due}</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-study-note">
            <span className="eyebrow">UNA MANO CADA VEZ</span>
            <strong>El porqué importa.</strong>
            <p>
              Estudia con calma.
              <br />
              Decide con criterio.
            </p>
          </div>
          <div className="profile">
            <span className="avatar">YO</span>
            <div>
              <strong>Mi academia</strong>
              <small>{s.settings.format}</small>
            </div>
            <button
              className="icon-button"
              aria-label="Cerrar sesión"
              onClick={async () => {
                await fetch("/api/auth", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ logout: true }),
                });
                router.replace("/login");
                router.refresh();
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      {mobile && (
        <button
          className="mobile-backdrop"
          aria-label="Cerrar navegación"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div>
            <button
              className="icon-button mobile-menu"
              aria-label="Abrir menú"
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </button>
            <span className="breadcrumb">
              Mi espacio <ChevronRight size={13} />
              <strong>{active.label}</strong>
            </span>
          </div>
          <button
            className="search-shortcut"
            onClick={() => navigate("search")}
          >
            <Search size={15} />
            <span>Buscar en mi conocimiento</span>
            <kbd>Ctrl K</kbd>
          </button>
          <span className="privacy">
            <ShieldCheck size={14} /> Privado
          </span>
        </header>
        <main className="main-content" id="main-content">
          {loadError && (
            <div className="error-box" role="alert">
              {loadError}
            </div>
          )}
          {nav === "dashboard" ? (
            <Dashboard {...ctx} />
          ) : nav === "library" ? (
            <LibraryPage {...ctx} />
          ) : nav === "academy" ? (
            <Academy
              {...ctx}
              initialLessonId={lessonToOpen}
              key={lessonToOpen}
            />
          ) : nav === "search" ? (
            <SearchPage {...ctx} />
          ) : nav === "workshops" ? (
            <Workshops {...ctx} />
          ) : nav === "trainer" ? (
            <Trainer
              {...ctx}
              initialLessonId={lessonToOpen}
              key={lessonToOpen}
            />
          ) : nav === "review" ? (
            <ReviewPage {...ctx} />
          ) : nav === "hands" ? (
            <HandsPage {...ctx} />
          ) : nav === "leaks" ? (
            <LeaksPage {...ctx} />
          ) : (
            <SettingsPage {...ctx} />
          )}
        </main>
        <footer>
          Estudio fuera de las partidas{" "}
          <span>Fuentes verificables · Sin asistencia en tiempo real</span>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span>{toast}</span>
          <button
            className="icon-button"
            aria-label="Cerrar aviso"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {busy && (
        <div className="working" aria-live="polite">
          <LoaderCircle className="spin" size={14} /> Guardando…
        </div>
      )}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
function LibraryPage(ctx: Context) {
  const { s, act, busy, notify } = ctx;
  const [urls, setUrls] = useState("");
  const [filter, setFilter] = useState("");
  const [tag, setTag] = useState("");
  const [selected, setSelected] = useState("");
  const [text, setText] = useState("");
  const [name, setName] = useState("transcripcion.txt");
  const [rights, setRights] = useState(false);
  const [provider, setProvider] = useState<"extractive" | "ai">("extractive");
  const [budget, setBudget] = useState("1");
  const [estimate, setEstimate] = useState<Reply>();
  const [confirmed, setConfirmed] = useState(false);
  const [pageToken, setPageToken] = useState<string>();
  const [syncing, setSyncing] = useState(false);
  const video = s.videos.find((v) => v.id === selected);
  const list = s.videos.filter(
    (v) =>
      v.sourceType !== "editorial" &&
      `${v.title} ${v.tags.join(" ")}`
        .toLowerCase()
        .includes(filter.toLowerCase()) &&
      (!tag || v.tags.includes(tag) || v.status === tag),
  );
  async function sync() {
    setSyncing(true);
    const r = await act({ op: "sync", channel: s.settings.channel, pageToken });
    if (r) {
      setPageToken(r.nextPageToken);
      notify(
        `${r.added} vídeos nuevos. ${r.limited ? "Feed reciente importado; no contiene todo el histórico." : r.nextPageToken ? "Hay más páginas disponibles." : "Catálogo sincronizado."}`,
      );
    }
    setSyncing(false);
  }
  return (
    <>
      <PageHeading
        eyebrow="FUENTES ANTES QUE RESÚMENES"
        title="Tu biblioteca de conocimiento"
        subtitle="Importa metadatos. Aporta una transcripción autorizada. Conserva cada referencia."
      />
      <section className="panel import-panel">
        <div>
          <h2>Importar vídeos</h2>
          <p className="muted">
            Una URL por línea. Sin API key se guardan las URLs con metadatos
            pendientes.
          </p>
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            aria-label="URLs de vídeos"
            rows={3}
          />
          <div className="button-row">
            <Button
              disabled={busy || !urls.trim()}
              onClick={async () => {
                const r = await act({ op: "importUrls", urls });
                if (r) {
                  setUrls("");
                  notify(
                    `${r.added} vídeos añadidos. ${r.inaccessible ? "Algunos vídeos no son públicos o no son accesibles." : ""}`,
                  );
                }
              }}
            >
              <Plus size={15} /> Importar URLs
            </Button>
            <Button
              variant="secondary"
              disabled={busy || syncing}
              onClick={() => void sync()}
            >
              {pageToken ? "Importar siguiente página" : "Sincronizar canal"}{" "}
              <RotateCcw size={15} />
            </Button>
          </div>
          {!s.capabilities.youtube && (
            <p className="micro">
              Sin clave se consulta el feed oficial de publicaciones recientes.
              Para el histórico paginado, configura YOUTUBE_API_KEY. Las
              transcripciones se importan por separado.
            </p>
          )}
        </div>
        <div className="import-guide">
          <span className="eyebrow">EL FLUJO DE UNA FUENTE</span>
          {[
            "Vídeo y metadatos",
            "Transcripción autorizada",
            "Extracción con checkpoints",
            "Revisión → lección → práctica",
          ].map((t, i) => (
            <div key={t}>
              <span>{i + 1}</span>
              {t}
            </div>
          ))}
        </div>
      </section>
      <div className="filterbar">
        <label className="search-field">
          <Search size={17} />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar título o tema"
            aria-label="Filtrar biblioteca"
          />
        </label>
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          aria-label="Filtrar tema o estado"
        >
          <option value="">Todos los temas y estados</option>
          {[
            ...new Set(s.videos.flatMap((v) => v.tags)),
            "transcript_missing",
            "transcript_ready",
            "needs_review",
            "published",
            "failed",
          ].map((t) => (
            <option key={t} value={t}>
              {statusLabels[t] ?? t}
            </option>
          ))}
        </select>
        <span className="muted">{list.length} fuentes</span>
      </div>
      <div className="video-grid">
        {list.map((v) => (
          <button
            className={`panel video-card ${v.id === selected ? "selected" : ""}`}
            key={v.id}
            onClick={() => {
              setSelected(v.id);
              setText("");
              setName("transcripcion.txt");
              setEstimate(undefined);
              setConfirmed(false);
              setRights(false);
            }}
          >
            <div className="video-thumbnail">
              {v.thumbnail ? (
                <Image
                  src={v.thumbnail}
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width:700px) 100vw, 33vw"
                />
              ) : (
                <FileText size={30} />
              )}
              <span>
                {v.demo ? "DEMO · FUENTE FICTICIA" : "YOUTUBE · FUENTE EXTERNA"}
              </span>
              <small>
                {v.duration !== undefined
                  ? time(v.duration)
                  : "Duración pendiente"}
              </small>
            </div>
            <div className="video-info">
              <div className="tag-row">
                <Badge green={v.status === "published"}>
                  {statusLabels[v.status]}
                </Badge>
                {!v.relevant && <Badge>Excluido</Badge>}
              </div>
              <h3>{v.title}</h3>
              <p>{v.tags.join(" · ") || "Temas por clasificar"}</p>
              <div className="video-footer">
                <span>
                  {s.concepts.filter((c) => c.videoId === v.id).length}{" "}
                  conceptos
                </span>
                <ChevronRight size={16} />
              </div>
            </div>
          </button>
        ))}
      </div>
      {!list.length && (
        <Empty title="Todavía no hay fuentes para este filtro">
          <p>Importa una URL o carga los ejemplos desde Ajustes.</p>
        </Empty>
      )}
      {video && (
        <section className="panel source-workspace">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FUENTE SELECCIONADA</span>
              <h2>{video.title}</h2>
            </div>
            <button
              className="icon-button"
              aria-label="Cerrar fuente"
              onClick={() => setSelected("")}
            >
              <X size={18} />
            </button>
          </div>
          <div className="button-row">
            {video.url && (
              <a
                className="button button-secondary"
                href={video.url}
                target="_blank"
                rel="noreferrer"
              >
                Ver en YouTube <ExternalLink size={14} />
              </a>
            )}
            <label className="checkbox">
              <input
                type="checkbox"
                checked={video.relevant}
                onChange={(e) =>
                  void act({
                    op: "classification",
                    videoId: video.id,
                    relevant: e.target.checked,
                    tags: video.tags,
                  })
                }
              />{" "}
              Relevante para cash Hold’em
            </label>
          </div>
          <p className="micro">
            Publicado:{" "}
            {video.publishedAt
              ? new Date(video.publishedAt).toLocaleDateString("es-ES")
              : "Sin metadatos"}{" "}
            · Último procesamiento:{" "}
            {video.processedAt
              ? new Date(video.processedAt).toLocaleString("es-ES")
              : "Pendiente"}
          </p>
          {video.error && <p className="error-box">{video.error}</p>}
          <div className="two-cols">
            <div>
              <h3>Añadir transcripción</h3>
              <label>
                Archivo TXT, SRT o VTT
                <input
                  type="file"
                  accept=".txt,.srt,.vtt"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 8 * 1024 * 1024) {
                      notify("El archivo supera 8 MB.");
                      return;
                    }
                    setName(file.name);
                    setText(await file.text());
                  }}
                />
              </label>
              <label>
                O pega texto
                <textarea
                  rows={7}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Texto de la transcripción…"
                />
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={rights}
                  onChange={(e) => setRights(e.target.checked)}
                />{" "}
                Tengo derecho a utilizar este material.
              </label>
              <Button
                disabled={busy || !rights || !text.trim()}
                onClick={async () => {
                  if (
                    await act({
                      op: "transcript",
                      videoId: video.id,
                      text,
                      name,
                    })
                  ) {
                    setText("");
                    notify(
                      "Transcripción validada y guardada con sus segmentos.",
                    );
                  }
                }}
              >
                Guardar transcripción
              </Button>
              <p className="micro">
                {s.transcripts.filter((t) => t.videoId === video.id).length}{" "}
                versiones importadas. Los TXT no producen timestamps.
              </p>
            </div>
            <div>
              <h3>Procesar con control</h3>
              <label>
                Motor
                <select
                  value={provider}
                  onChange={(e) => {
                    setProvider(e.target.value as "extractive" | "ai");
                    setEstimate(undefined);
                    setConfirmed(false);
                  }}
                >
                  <option value="extractive">
                    Lectura extractiva · sin coste de IA
                  </option>
                  <option value="ai" disabled={!s.capabilities.ai}>
                    IA configurable · borradores revisables
                  </option>
                </select>
              </label>
              <p className="micro">
                El modo extractivo conserva el texto y propone una lectura
                guiada; no simula un resumen de IA.
              </p>
              {provider === "ai" && (
                <>
                  <label>
                    Presupuesto máximo por vídeo (USD)
                    <input
                      type="number"
                      min="0.01"
                      max="1000"
                      step="0.01"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </label>
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={async () => {
                      const r = await act({
                        op: "estimate",
                        videoId: video.id,
                      });
                      if (r) setEstimate(r);
                    }}
                  >
                    Estimar coste
                  </Button>
                  {estimate && (
                    <p>
                      {estimate.segments} bloques · reserva estimada $
                      {estimate.cost?.toFixed(4)} USD
                    </p>
                  )}
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                    />{" "}
                    Confirmo el gasto hasta el presupuesto indicado.
                  </label>
                </>
              )}
              <Button
                disabled={
                  busy ||
                  !s.transcripts.some((t) => t.videoId === video.id) ||
                  (provider === "ai" && (!confirmed || !estimate))
                }
                onClick={async () => {
                  if (
                    await act({
                      op: "queue",
                      videoId: video.id,
                      provider,
                      budget: Number(budget),
                      confirmed,
                    })
                  ) {
                    notify(
                      "Trabajo guardado. Ejecuta el worker CLI para procesarlo.",
                    );
                  }
                }}
              >
                Crear trabajo <ArrowRight size={15} />
              </Button>
              <div className="notice">
                <strong>Worker fuera de Vercel HTTP</strong>
                <code>npm run worker -- --once</code>
                <span>
                  Ejecuta este comando en tu ordenador o en un worker con acceso
                  a la misma base de datos.
                </span>
              </div>
            </div>
          </div>
          <h3>Trabajos y checkpoints</h3>
          {s.jobs
            .filter((j) => j.videoId === video.id)
            .map((j) => (
              <div className="job-row" key={j.id}>
                <div>
                  <Badge>{statusLabels[j.status]}</Badge>
                  <strong>
                    {j.cursor} / {j.total} bloques
                  </strong>
                  <p>
                    {j.provider === "ai" ? "IA" : "Extractivo"} · presupuesto $
                    {j.budget} · consumo/reserva $
                    {s.usage
                      .filter((u) => u.jobId === j.id)
                      .reduce((n, u) => n + u.cost, 0)
                      .toFixed(4)}
                  </p>
                  {j.error && <p className="error-text">{j.error}</p>}
                  <progress
                    value={j.cursor}
                    max={j.total}
                    aria-label="Progreso del procesamiento"
                  />
                </div>
                {j.status !== "completed" && (
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() =>
                      void act({
                        op: "job",
                        jobId: j.id,
                        status:
                          j.status === "running" || j.status === "queued"
                            ? "paused"
                            : "queued",
                      })
                    }
                  >
                    {j.status === "running" || j.status === "queued"
                      ? "Pausar"
                      : "Reanudar"}
                  </Button>
                )}
              </div>
            ))}
          <h3>Referencias importadas</h3>
          <SourceLinks
            s={s}
            ids={s.segments
              .filter((g) => g.videoId === video.id)
              .map((g) => g.id)}
          />
        </section>
      )}
    </>
  );
}
