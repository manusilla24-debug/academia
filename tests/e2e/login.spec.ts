import { test, expect } from "@playwright/test";
test("login local real sin campo email y cierre de sesión", async ({
  page,
}) => {
  await page.goto("/login");
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("e2e-local-password");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Una buena decisión cada vez." }),
  ).toBeVisible({ timeout: 30000 });
  await page
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .click();
  await expect(page).toHaveURL(/login/);
  expect((await page.request.get("/api/lab")).status()).toBe(401);
});
