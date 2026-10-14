import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";

test("un ejercicio pendiente no bloquea los test disponibles", async ({
  page,
}) => {
  execFileSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      `
    import { mutate } from './src/lib/db/store.ts';
    import { installCurriculum } from './src/lib/curriculum.ts';
    await mutate(s => {
      installCurriculum(s);
      s.exercises.unshift({
        ...s.exercises.find(e => e.id.startsWith('exercise_core_')),
        id: 'trainer_pending_fixture',
        prompt: 'Ejercicio pendiente que no debe bloquear la práctica',
        kind: 'pendiente'
      });
    });
  `,
    ],
    {
      env: {
        ...process.env,
        APP_MODE: "local",
        LOCAL_DB_PATH: process.env.E2E_DB_PATH,
      },
      timeout: 30000,
    },
  );
  await page.goto("/login");
  await page.getByRole("button", { name: "Abrir laboratorio local" }).click();
  await page.getByRole("button", { name: "Entrenador", exact: true }).click();
  const state = await (await page.request.get("/api/lab")).json();
  const ready = state.exercises.filter(
    (e: { demo: boolean; kind: string; lessonId: string }) =>
      !e.demo &&
      e.kind !== "pendiente" &&
      state.lessons.some(
        (l: { id: string; status: string }) =>
          l.id === e.lessonId && l.status === "published",
      ),
  );
  await expect(
    page.getByRole("button", { name: /^Practicar \(/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".exercise-card h2")).toHaveText(ready[0].prompt);
  await expect(page.locator(".exercise-option").first()).toBeEnabled();
  await page.locator(".exercise-option").first().click();
  await page
    .getByRole("button", { name: "Saltar ejercicio", exact: true })
    .click();
  await expect(page.locator(".exercise-card h2")).toHaveText(ready[1].prompt);
  await expect(
    page.getByRole("button", { name: "Guardar mi respuesta" }),
  ).toBeDisabled();
  await page.locator(".exercise-option").nth(ready[1].accepted[0]).click();
  await page.getByRole("button", { name: "Guardar mi respuesta" }).click();
  await expect(
    page.getByText("Respuesta aceptada", { exact: true }),
  ).toBeVisible();
  const saved = await (await page.request.get("/api/lab")).json();
  expect(
    saved.attempts.some(
      (a: { exerciseId: string; correct: boolean }) =>
        a.exerciseId === ready[1].id && a.correct,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Siguiente ejercicio", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Guardar mi respuesta" }),
  ).toBeDisabled();
  await expect(page.locator(".exercise-option.chosen")).toHaveCount(0);
  await page.getByRole("button", { name: /^Revisar pendientes/ }).click();
  await expect(
    page.getByRole("button", { name: "He revisado este ejercicio" }),
  ).toBeVisible();
  await expect(page.locator(".exercise-option").first()).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Guardar mi respuesta" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "He revisado este ejercicio" })
    .click();
  await expect(
    page.getByRole("button", { name: /^Practicar \(/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".exercise-option").first()).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Guardar mi respuesta" }),
  ).toBeDisabled();
});
