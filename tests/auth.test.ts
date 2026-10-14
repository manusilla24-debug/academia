import { describe, it, expect, vi } from "vitest";
import { scryptSync } from "node:crypto";
import {
  signSession,
  validSession,
  validPassword,
  demoAllowed,
  sameOrigin,
} from "../src/lib/auth";
describe("privacidad y sesiones", () => {
  it("admite un hash local con mínimo explícito sin guardar el texto de contraseña", () => {
    vi.stubEnv("LOCAL_PASSWORD_MIN_LENGTH", "7");
    vi.stubEnv(
      "LOCAL_PASSWORD_HASH",
      `test-salt:${scryptSync("local77", "test-salt", 32).toString("hex")}`,
    );
    expect(validPassword("local77")).toBe(true);
    expect(validPassword("wrong77")).toBe(false);
    vi.unstubAllEnvs();
  });
  it("verifica firma, caducidad y manipulación de sesiones", () => {
    vi.stubEnv(
      "SESSION_SECRET",
      "test-secret-with-at-least-thirty-two-characters",
    );
    const token = signSession();
    expect(validSession(token)).toBe(true);
    expect(validSession(token + "x")).toBe(false);
    expect(validSession("arbitrary")).toBe(false);
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 9 * 3600000);
    expect(validSession(token)).toBe(false);
    vi.useRealTimers();
  });
  it("la contraseña local exige longitud mínima y comparación segura", () => {
    vi.stubEnv("LOCAL_PASSWORD", "a-long-private-password");
    expect(validPassword("a-long-private-password")).toBe(true);
    expect(validPassword("wrong")).toBe(false);
    vi.stubEnv("LOCAL_PASSWORD", "short");
    expect(validPassword("short")).toBe(false);
  });
  it("la entrada DEMO jamás se habilita en producción", () => {
    vi.stubEnv("LOCAL_DEMO_LOGIN", "true");
    vi.stubEnv("NODE_ENV", "production");
    expect(demoAllowed()).toBe(false);
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("APP_MODE", "supabase");
    expect(demoAllowed()).toBe(false);
    vi.stubEnv("APP_MODE", "local");
    expect(demoAllowed()).toBe(true);
  });
  it("rechaza peticiones mutadoras de otro origen", () => {
    expect(
      sameOrigin(
        new Request("https://lab.test/api/lab", {
          headers: { origin: "https://evil.test" },
        }),
      ),
    ).toBe(false);
    expect(
      sameOrigin(
        new Request("https://lab.test/api/lab", {
          headers: { origin: "https://lab.test" },
        }),
      ),
    ).toBe(true);
    expect(sameOrigin(new Request("https://lab.test/api/lab"))).toBe(false);
    expect(
      sameOrigin(
        new Request("http://localhost:3100/api/auth", {
          headers: { host: "127.0.0.1:3100", origin: "http://127.0.0.1:3100" },
        }),
      ),
    ).toBe(true);
  });
});
