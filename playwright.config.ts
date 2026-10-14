import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";
const db = process.env.E2E_DB_PATH ?? resolve(`data/e2e-${Date.now()}.db`);
process.env.E2E_DB_PATH = db;
export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  fullyParallel: false,
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:3100",
    viewport: { width: 1440, height: 1050 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://127.0.0.1:3100/login",
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      NEXT_DIST_DIR: ".next-e2e",
      APP_MODE: "local",
      LOCAL_DEMO_LOGIN: "true",
      LOCAL_PASSWORD: "e2e-local-password",
      LOCAL_PASSWORD_HASH: "",
      LOCAL_PASSWORD_MIN_LENGTH: "12",
      LOCAL_DB_PATH: db,
      SESSION_SECRET: "e2e-private-session-secret-of-at-least-32-chars",
      YOUTUBE_API_KEY: "",
      AI_API_KEY: "",
    },
  },
});
