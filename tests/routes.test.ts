import { describe, it, expect, vi, beforeAll } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const guard = vi.hoisted(() => ({ allowed: false }));
vi.mock("../src/lib/auth", () => ({
  authenticated: async () => guard.allowed,
  sameOrigin: (r: Request) => r.headers.get("origin") === new URL(r.url).origin,
}));
import { GET, POST } from "../src/app/api/lab/route";
import { GET as exportGet } from "../src/app/api/export/route";
import { GET as searchGet } from "../src/app/api/search/route";
import { GET as sourceGet } from "../src/app/api/source/route";
beforeAll(() => {
  process.env.APP_MODE = "local";
  process.env.LOCAL_DB_PATH = join(
    mkdtempSync(join(tmpdir(), "poker-routes-")),
    "test.db",
  );
});
describe("protección y persistencia de endpoints", () => {
  it("protege datos, exportación, búsqueda y mutations sin sesión", async () => {
    expect((await GET()).status).toBe(401);
    expect(
      (
        await POST(
          new Request("http://localhost/api/lab", {
            method: "POST",
            body: "{}",
          }),
        )
      ).status,
    ).toBe(401);
    expect(
      (await exportGet(new Request("http://localhost/api/export"))).status,
    ).toBe(401);
    expect(
      (await searchGet(new Request("http://localhost/api/search?q=turn")))
        .status,
    ).toBe(401);
    expect(
      (await sourceGet(new Request("http://localhost/api/source?id=s"))).status,
    ).toBe(401);
  });
  it("rechaza CSRF incluso con propietario autenticado", async () => {
    guard.allowed = true;
    expect(
      (
        await POST(
          new Request("http://localhost/api/lab", {
            method: "POST",
            headers: { origin: "https://evil.test" },
            body: JSON.stringify({ op: "seed" }),
          }),
        )
      ).status,
    ).toBe(403);
  });
  it("valida inputs y persiste el demo en la base local", async () => {
    const post = (body: object) =>
      POST(
        new Request("http://localhost/api/lab", {
          method: "POST",
          headers: {
            origin: "http://localhost",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }),
      );
    expect((await post({ op: "not-real" })).status).toBe(400);
    expect((await post({ op: "seed" })).status).toBe(200);
    const data = await (await GET()).json();
    expect(data.lessons).toHaveLength(3);
    expect(data.capabilities).not.toHaveProperty("key");
    const e = data.exercises[0];
    expect(
      (await post({ op: "attempt", exerciseId: e.id, choice: 99 })).status,
    ).toBe(400);
    expect(
      (await post({ op: "attempt", exerciseId: e.id, choice: 0 })).status,
    ).toBe(200);
    expect((await (await GET()).json()).attempts).toHaveLength(1);
  });
});
