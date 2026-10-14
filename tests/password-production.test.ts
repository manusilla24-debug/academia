import { afterEach, describe, expect, it, vi } from "vitest";
import { scryptSync } from "node:crypto";

const jar = vi.hoisted(() => ({
  values: new Map<string, string>(),
  set: vi.fn(),
  delete: vi.fn(),
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (key: string) => {
      const value = jar.values.get(key);
      return value ? { value } : undefined;
    },
    set: (key: string, value: string, options: object) => {
      jar.values.set(key, value);
      jar.set(key, value, options);
    },
    delete: (key: string) => {
      jar.values.delete(key);
      jar.delete(key);
    },
  }),
}));
import { authenticated, demoAllowed, usesSupabaseAuth } from "../src/lib/auth";
import { POST } from "../src/app/api/auth/route";

afterEach(() => {
  vi.unstubAllEnvs();
  jar.values.clear();
  vi.clearAllMocks();
});

describe("contraseña privada en producción con PostgreSQL", () => {
  it("autentica sin email, conserva la sesión entre peticiones y revoca al salir", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("APP_MODE", "supabase");
    vi.stubEnv("AUTH_MODE", "password");
    vi.stubEnv("LOCAL_DEMO_LOGIN", "true");
    vi.stubEnv("LOCAL_PASSWORD_MIN_LENGTH", "7");
    vi.stubEnv(
      "LOCAL_PASSWORD_HASH",
      `salt:${scryptSync("testing", "salt", 32).toString("hex")}`,
    );
    vi.stubEnv(
      "SESSION_SECRET",
      "production-test-secret-with-at-least-32-characters",
    );
    vi.stubEnv("APP_ORIGIN", "https://academy.example");
    const login = (body: object) =>
      POST(
        new Request("https://academy.example/api/auth", {
          method: "POST",
          headers: {
            origin: "https://academy.example",
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
        }),
      );
    expect(usesSupabaseAuth()).toBe(false);
    expect(demoAllowed()).toBe(false);
    expect(await authenticated()).toBe(false);
    expect((await login({ demo: true })).status).toBe(401);
    expect((await login({ password: "wrong" })).status).toBe(401);
    expect((await login({ password: "testing" })).status).toBe(200);
    expect(jar.set).toHaveBeenCalledWith(
      "poker_session",
      expect.any(String),
      expect.objectContaining({
        secure: true,
        httpOnly: true,
        sameSite: "strict",
      }),
    );
    expect(await authenticated()).toBe(true);
    expect((await login({ logout: true })).status).toBe(200);
    expect(await authenticated()).toBe(false);
  });

  it("mantiene Supabase Auth como opción predeterminada y cierra modos desconocidos", async () => {
    vi.stubEnv("APP_MODE", "supabase");
    vi.stubEnv("AUTH_MODE", "");
    expect(usesSupabaseAuth()).toBe(true);
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_MODE", "unknown");
    vi.stubEnv("AUTH_MODE", "password");
    expect(await authenticated()).toBe(false);
  });
});
