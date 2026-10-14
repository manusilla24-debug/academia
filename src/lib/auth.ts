import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
const devSecret = randomBytes(32).toString("hex");
export function usesSupabaseAuth() {
  return (
    process.env.APP_MODE === "supabase" && process.env.AUTH_MODE !== "password"
  );
}
export function demoAllowed() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.APP_MODE !== "supabase" &&
    process.env.LOCAL_DEMO_LOGIN === "true"
  );
}
function secret() {
  const value = process.env.SESSION_SECRET;
  if (value && value.length >= 32) return value;
  if (demoAllowed()) return devSecret;
  throw new Error("Configura SESSION_SECRET (mínimo 32 caracteres).");
}
export function signSession() {
  const payload = JSON.stringify({
    owner: true,
    expires: Date.now() + 8 * 3600000,
  });
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${createHmac("sha256", secret()).update(encoded).digest("base64url")}`;
}
export function validSession(token: string) {
  try {
    const [payload, signature] = token.split(".");
    const expected = createHmac("sha256", secret())
      .update(payload)
      .digest("base64url");
    if (
      !signature ||
      signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    )
      return false;
    const value = JSON.parse(Buffer.from(payload, "base64url").toString());
    return (
      value.owner === true &&
      Number.isFinite(value.expires) &&
      value.expires > Date.now()
    );
  } catch {
    return false;
  }
}
export function validPassword(password: string) {
  const minimum = Number(process.env.LOCAL_PASSWORD_MIN_LENGTH || 12);
  const stored = process.env.LOCAL_PASSWORD_HASH;
  if (stored) {
    try {
      const [salt, digest] = stored.split(":");
      const expected = Buffer.from(digest, "hex");
      if (!salt || expected.length !== 32 || password.length < minimum)
        return false;
      return timingSafeEqual(scryptSync(password, salt, 32), expected);
    } catch {
      return false;
    }
  }
  const expected = process.env.LOCAL_PASSWORD;
  if (!expected || expected.length < minimum) return false;
  return timingSafeEqual(
    scryptSync(password, "poker-study-local", 32),
    scryptSync(expected, "poker-study-local", 32),
  );
}
export async function supabase() {
  const jar = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !process.env.OWNER_USER_ID)
    throw new Error("Configura Supabase y OWNER_USER_ID.");
  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (items) => {
        try {
          items.forEach(({ name, value, options }) =>
            jar.set(name, value, options),
          );
        } catch {
          /* Server component read; refresh is persisted by API routes. */
        }
      },
    },
  });
}
export async function authenticated() {
  if (usesSupabaseAuth()) {
    try {
      const client = await supabase();
      const { data, error } = await client.auth.getUser();
      return (
        !error && !!data.user && data.user.id === process.env.OWNER_USER_ID
      );
    } catch {
      return false;
    }
  }
  if (
    process.env.NODE_ENV === "production" &&
    process.env.APP_MODE !== "local" &&
    !(
      process.env.APP_MODE === "supabase" &&
      process.env.AUTH_MODE === "password"
    )
  )
    return false;
  return validSession((await cookies()).get("poker_session")?.value ?? "");
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const expected =
    process.env.APP_ORIGIN ||
    `${url.protocol}//${request.headers.get("host") ?? url.host}`;
  return !!origin && origin === expected;
}
