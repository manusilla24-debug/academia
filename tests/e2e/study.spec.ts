import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
test("fuente → worker → revisión → lección → práctica → persistencia", async ({
  page,
}) => {
  expect((await page.request.get("/api/lab")).status()).toBe(401);
  expect((await page.request.get("/api/export")).status()).toBe(401);
  await page.goto("/");
  await expect(page).toHaveURL(/login/);
  await page.getByRole("button", { name: "Abrir laboratorio local" }).click();
  await expect(
    page.getByRole("heading", { name: "Una buena decisión cada vez." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Biblioteca", exact: true }).click();
  await page
    .getByRole("textbox", { name: "URLs de vídeos" })
    .fill("https://www.youtube.com/watch?v=abcdefghijk");
  await page
    .getByRole("button", { name: "Importar URLs", exact: true })
    .click();
  await page
    .getByRole("button")
    .filter({
      has: page.getByRole("heading", {
        name: "Vídeo abcdefghijk · metadatos pendientes",
      }),
    })
    .click();
  await page.getByLabel("Archivo TXT, SRT o VTT").setInputFiles({
    name: "source.srt",
    mimeType: "text/plain",
    buffer: Buffer.from(readFileSync("fixtures/demo.es.srt", "utf8")),
  });
  await page.getByLabel("Tengo derecho a utilizar este material.").check();
  await page
    .getByRole("button", { name: "Guardar transcripción", exact: true })
    .click();
  await expect(page.getByText("1 versiones importadas.")).toBeVisible();
  await page.getByRole("button", { name: "Crear trabajo" }).click();
  await expect(page.getByText("En cola", { exact: true })).toBeVisible();
  const workerOutput = execFileSync(
    process.execPath,
    ["--import", "tsx", "scripts/worker.ts", "--once"],
    {
      env: {
        ...process.env,
        APP_MODE: "local",
        LOCAL_DB_PATH: process.env.E2E_DB_PATH,
      },
      timeout: 30000,
    },
  ).toString();
  expect(workerOutput).toContain("1 trabajo(s)");
  await page.reload();
  await page.getByRole("button", { name: "Mi academia", exact: true }).click();
  await page.getByRole("button", { name: "Por revisar", exact: true }).click();
  await page
    .getByRole("button")
    .filter({
      has: page.getByRole("heading", {
        name: "Vídeo abcdefghijk · metadatos pendientes",
      }),
    })
    .click();
  await page.getByRole("button", { name: "Editar y revisar" }).click();
  await page
    .getByLabel("Título", { exact: true })
    .fill("Lección de prueba con fuentes");
  await page
    .getByLabel("He contrastado las afirmaciones, condiciones y referencias.")
    .check();
  await page.getByRole("button", { name: "Publicar revisada" }).click();
  await expect(
    page.getByRole("heading", { name: "Lección de prueba con fuentes" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Completar lectura" }).click();
  await page
    .getByLabel("Mis notas")
    .fill("Revisar rangos antes del second barrel.");
  await page
    .getByRole("button", { name: "Guardar notas", exact: true })
    .click();
  await page.getByRole("button", { name: "Preparar práctica" }).click();
  const data = await (await page.request.get("/api/lab")).json();
  expect(data.progress[0].completed).toBe(true);
  expect(data.progress[0].notes).toContain("second barrel");
  expect(data.exercises.length).toBeGreaterThan(0);
  expect(data.concepts[0].segmentIds.length).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Entrenador", exact: true }).click();
  await page
    .getByRole("button", { name: "He revisado este ejercicio" })
    .click();
  await page
    .locator(".exercise-option")
    .nth(data.exercises[0].accepted[0])
    .click();
  await page.getByRole("button", { name: "Guardar mi respuesta" }).click();
  await expect(
    page.getByText("Respuesta aceptada", { exact: true }),
  ).toBeVisible();
  expect(
    (await (await page.request.get("/api/lab")).json()).attempts,
  ).toHaveLength(1);
  await page
    .getByRole("button", { name: "Buscar conocimiento", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Consulta de conocimiento" })
    .fill("rangos turn");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(
    page.getByText("Fragmento recuperado", { exact: true }).first(),
  ).toBeVisible();
  const backup = await page.request.get("/api/export");
  expect(backup.status()).toBe(200);
  expect((await backup.json()).schemaVersion).toBe(1);
  // Real application with explicitly labelled demo content, for layout verification.
  await page.request.post("/api/lab", {
    data: { op: "seed" },
    headers: { origin: "http://127.0.0.1:3100" },
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Una buena decisión cada vez." }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("button", { name: "Mis manos", exact: true }).click();
  await page
    .getByRole("button")
    .filter({ hasText: "DEMO · Thin value en river" })
    .click();
  await expect(page.locator(".poker-table")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/hand-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Registrar mano" }).click();
  await page
    .getByLabel("Título de la mano")
    .fill("Mi primera mano persistente");
  await page
    .getByLabel("Mi razonamiento", { exact: true })
    .fill("Quiero comparar check y c-bet por rangos.");
  await page.getByRole("button", { name: "Validar y guardar" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  const hands = (await (await page.request.get("/api/lab")).json()).hands;
  expect(
    hands.some(
      (h: { title: string }) => h.title === "Mi primera mano persistente",
    ),
  ).toBe(true);
});
