import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
test.use({ reducedMotion: "reduce" });

test("academia: conceptos, práctica integrada, progreso y diseño adaptable", async ({
  page,
}) => {
  test.setTimeout(120000);
  execFileSync(process.execPath, ["--import", "tsx", "scripts/curriculum.ts"], {
    env: {
      ...process.env,
      APP_MODE: "local",
      LOCAL_DB_PATH: process.env.E2E_DB_PATH,
    },
    timeout: 30000,
  });
  execFileSync(process.execPath, ["--import", "tsx", "scripts/catalogue.ts"], {
    env: {
      ...process.env,
      APP_MODE: "local",
      LOCAL_DB_PATH: process.env.E2E_DB_PATH,
    },
    timeout: 30000,
  });
  await page.goto("/login");
  await page.getByRole("button", { name: "Abrir laboratorio local" }).click();
  await expect(
    page.getByRole("heading", {
      name: "El siguiente nivel empieza por entender el porqué.",
    }),
  ).toBeVisible({ timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/academy-home-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Entrar en clase", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "La estrategia de la academia: primero valor, después ajustes",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Abrir entrenador" }).click();
  await expect(page.getByLabel("Practicar un concepto")).toHaveValue(
    "academy_estrategia-academia",
  );
  await page
    .getByRole("button", { name: "Revisar lección", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "La estrategia de la academia: primero valor, después ajustes",
      exact: true,
    }),
  ).toBeVisible();
  const question = page.locator(".inline-question").first();
  await expect(
    question.getByRole("button", { name: "Comprobar mi razonamiento" }),
  ).toBeDisabled();
  const state = await (await page.request.get("/api/lab")).json();
  const exercise = state.exercises.find(
    (e: { lessonId: string }) => e.lessonId === "academy_estrategia-academia",
  );
  await question.locator(".exercise-option").nth(exercise.accepted[0]).click();
  await question
    .getByRole("button", { name: "Comprobar mi razonamiento" })
    .click();
  await expect(
    question.getByText("Respuesta aceptada", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Completar lectura", exact: true })
    .click();
  await page
    .getByLabel("Mis notas")
    .fill("Mi plan: identificar calls peores antes de apostar.");
  await page
    .getByRole("button", { name: "Guardar notas", exact: true })
    .click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/academy-class-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Mi academia", exact: true }).click();
  await page.getByRole("textbox", { name: "Buscar clases" }).fill("bluffcatch");
  await expect(
    page.getByRole("heading", {
      name: "Por qué no pagar de más en NL2: el bluffcatch con criterio",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button")
    .filter({
      has: page.getByRole("heading", {
        name: "Por qué no pagar de más en NL2: el bluffcatch con criterio",
        exact: true,
      }),
    })
    .click();
  await expect(
    page
      .locator(".lesson-prose")
      .getByText("En la clase de hoy aprenderemos por qué pagar", {
        exact: false,
      }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mi academia", exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/academy-curriculum-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Revisiones de manos", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Aprende dentro de la mano.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".workshop-card").first()).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/academy-workshops-desktop.png",
    fullPage: true,
  });
  await page.reload();
  await page.getByRole("button", { name: "Mi academia", exact: true }).click();
  await page
    .getByRole("button")
    .filter({
      has: page.getByRole("heading", {
        name: "La estrategia de la academia: primero valor, después ajustes",
        exact: true,
      }),
    })
    .click();
  await expect(page.getByLabel("Mis notas")).toHaveValue(
    "Mi plan: identificar calls peores antes de apostar.",
  );
  await expect(
    page.getByRole("button", { name: "Marcar pendiente", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/academy-class-mobile.png",
    fullPage: true,
  });
  const destinations = [
    "Mi estudio",
    "Mi academia",
    "Revisiones de manos",
    "Biblioteca",
    "Buscar conocimiento",
    "Entrenador",
    "Repaso",
    "Mis manos",
    "Mis leaks",
    "Ajustes",
  ];
  for (const [i, name] of destinations.entries()) {
    await page.getByRole("button", { name: "Abrir menú", exact: true }).click();
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.locator(".mobile-backdrop")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `overflow móvil en ${name}`,
    ).toBe(true);
    if (i < 3) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: `test-results/academy-mobile-${i}.png`,
        fullPage: true,
      });
    }
  }
});
