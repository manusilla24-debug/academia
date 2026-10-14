import { describe, it, expect, beforeAll, vi } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mutate, readState } from "../src/lib/db/store";
import {
  addTranscript,
  queueJob,
  runOneJob,
  generatePractice,
} from "../src/lib/pipeline";
import { ExtractiveProvider, type KnowledgeProvider } from "../src/lib/ai";
import { now } from "../src/lib/domain";
beforeAll(() => {
  process.env.APP_MODE = "local";
  process.env.LOCAL_DB_PATH = join(
    mkdtempSync(join(tmpdir(), "poker-pipeline-")),
    "test.db",
  );
});
describe("pipeline persistente", () => {
  it("reanuda una fuente larga sin duplicar checkpoints ni perder trazabilidad", async () => {
    await mutate((s) => {
      s.videos.push({
        id: "long",
        title: "Cash NL5",
        demo: false,
        relevant: true,
        tags: [],
        status: "transcript_missing",
        createdAt: now(),
      });
      const text =
        "En turn considera los rangos, el tamaño del bote y el rival. ".repeat(
          2200,
        );
      const t = addTranscript(s, "long", text, "long.txt");
      expect(addTranscript(s, "long", text, "long.txt").id).toBe(t.id);
      const job = queueJob(s, "long", "extractive", 0, false);
      expect(queueJob(s, "long", "extractive", 0, false).id).toBe(job.id);
    });
    expect(await runOneJob(undefined, 2)).toBe(true);
    let s = await readState();
    expect(s.jobs[0].cursor).toBe(2);
    expect(s.jobs[0].status).toBe("queued");
    await runOneJob();
    s = await readState();
    expect(s.jobs[0].status).toBe("completed");
    expect(s.jobs[0].cursor).toBe(s.jobs[0].total);
    expect(s.lessons).toHaveLength(1);
    for (const c of s.concepts)
      expect(
        c.segmentIds.every((id) =>
          s.segments.some((g) => g.id === id && g.text.includes(c.quote)),
        ),
      ).toBe(true);
    expect(await runOneJob()).toBe(false);
    await mutate((s) => {
      s.lessons[0].status = "published";
      generatePractice(s, s.lessons[0].id);
      const count = s.exercises.length;
      generatePractice(s, s.lessons[0].id);
      expect(s.exercises).toHaveLength(count);
    });
    const final = await readState();
    expect(final.exercises.length).toBeGreaterThan(0);
    expect(final.cards.length).toBe(final.exercises.length);
  });
  it("persiste un fallo y reanuda desde el mismo cursor", async () => {
    await mutate((s) => {
      s.videos.push({
        id: "failure",
        title: "River cash",
        demo: false,
        relevant: true,
        tags: [],
        status: "transcript_missing",
        createdAt: now(),
      });
      addTranscript(
        s,
        "failure",
        "Un bluffcatcher gana principalmente a faroles. Considera blockers, tamaños y rangos.",
        "f.txt",
      );
      queueJob(s, "failure", "extractive", 0, false);
    });
    const fail: KnowledgeProvider = {
      extract: async () => {
        throw new Error("Proveedor temporalmente no disponible.");
      },
    };
    await runOneJob(fail);
    let s = await readState();
    const j = s.jobs.find((j) => j.videoId === "failure")!;
    expect(j.status).toBe("failed");
    expect(j.cursor).toBe(0);
    await mutate((s) => {
      s.jobs.find((job) => job.id === j.id)!.status = "queued";
    });
    await runOneJob(new ExtractiveProvider());
    s = await readState();
    expect(s.jobs.find((job) => job.id === j.id)!.status).toBe("completed");
  });
  it("bloquea trabajos de pago sin confirmación y presupuesto", async () => {
    await mutate((s) => {
      expect(() => queueJob(s, "failure", "ai", 0, false)).toThrow();
    });
  });
  it("una transcripción nueva pausa los trabajos antiguos", async () => {
    await mutate((s) => {
      const t = addTranscript(
        s,
        "failure",
        "Una nueva versión de la fuente con condiciones y excepciones para estudiar el river.",
        "new.txt",
      );
      const job = queueJob(s, "failure", "extractive", 0, false);
      expect(job.transcriptHash).toBe(t.hash);
      addTranscript(
        s,
        "failure",
        "Una tercera versión completa de la fuente para revisar el valor y las condiciones.",
        "newer.txt",
      );
      expect(job.status).toBe("paused");
    });
  });
  it("detener el procesamiento evita nuevas llamadas", async () => {
    await mutate((s) => {
      s.settings.stopJobs = true;
    });
    expect(await runOneJob()).toBe(false);
  });
  it("reutiliza extracción de bloques idénticos sin llamadas IA repetidas", async () => {
    process.env.AI_API_KEY = "test-key";
    process.env.AI_MODEL = "test-model";
    process.env.AI_INPUT_USD_PER_MILLION = "1";
    process.env.AI_OUTPUT_USD_PER_MILLION = "1";
    await mutate((s) => {
      s.settings.stopJobs = false;
      s.videos.push({
        id: "cache",
        title: "Cash turn",
        demo: false,
        relevant: true,
        tags: [],
        status: "transcript_missing",
        createdAt: now(),
      });
      addTranscript(
        s,
        "cache",
        "El rango de BB conserva parejas y proyectos en boards bajos. ".repeat(
          1800,
        ),
        "cache.txt",
      );
      queueJob(s, "cache", "ai", 1, true);
    });
    const provider = new ExtractiveProvider();
    const extract = vi.fn(provider.extract.bind(provider));
    await runOneJob({ extract });
    const state = await readState();
    const unique = new Set(
      state.segments.filter((g) => g.videoId === "cache").map((g) => g.hash),
    );
    expect(extract).toHaveBeenCalledTimes(unique.size);
    expect(state.jobs.find((j) => j.videoId === "cache")!.status).toBe(
      "completed",
    );
    expect(
      state.usage.filter(
        (u) => u.jobId === state.jobs.find((j) => j.videoId === "cache")!.id,
      ),
    ).toHaveLength(unique.size);
  });
  it("excluye transcripciones de Omaha antes de permitir un trabajo", async () => {
    await mutate((s) => {
      s.settings.stopJobs = false;
      s.videos.push({
        id: "plo",
        title: "Contenido por clasificar",
        demo: false,
        relevant: true,
        tags: [],
        status: "transcript_missing",
        createdAt: now(),
      });
      addTranscript(
        s,
        "plo",
        "Esta review de Omaha PLO analiza manos y proyectos en un formato ajeno al cash Holdem.",
        "plo.txt",
      );
      expect(s.videos.find((v) => v.id === "plo")!.relevant).toBe(false);
      expect(() => queueJob(s, "plo", "extractive", 0, false)).toThrow(
        "excluido",
      );
    });
  });
});
