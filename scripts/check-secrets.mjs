import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";

// Never print a matching value: diagnostics contain only paths and rule names.
const git = (...args) =>
  execFileSync("git", args, {
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
const findings = [];
const knownSecrets = new Set();
const placeholder = (value) =>
  !value ||
  /^(?:password$|\(contrase|(?:your|tu|valor|url)[-_ ]|(?:example|dummy|fixture|test|e2e)[-_])|\[(?:contrase|your|password)|\$\{|process\.env/i.test(
    value,
  );
for (const file of [
  ".env.local",
  ".env.production.local",
  "data/vercel-password.env",
]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(
      /^(AI_API_KEY|YOUTUBE_API_KEY|SESSION_SECRET|LOCAL_PASSWORD|LOCAL_PASSWORD_HASH|DATABASE_URL)=(.*)$/,
    );
    if (!match) continue;
    const value = match[2].replace(/^["']|["']$/g, "").trim();
    if (value.length >= 8 && !placeholder(value)) knownSecrets.add(value);
    if (match[1] === "DATABASE_URL") {
      try {
        const value = decodeURIComponent(new URL(match[2]).password);
        if (value.length >= 6 && !placeholder(value)) knownSecrets.add(value);
      } catch {
        /* Optional missing connection. */
      }
    }
  }
}
const forbidden = (file) =>
  (/(^|\/)(?:\.env(?:\..*)?|[^/]+\.(?:pem|p12|pfx|key|db|sqlite|sqlite3))$/i.test(
    file,
  ) &&
    file !== ".env.example") ||
  /^(?:data|\.vercel)\//.test(file);
const rules = [
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  [
    "github-token",
    /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/,
  ],
  ["provider-secret", /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{24,}\b/],
  ["aws-access-key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ["supabase-secret", /\bsb_secret_[A-Za-z0-9_-]{20,}\b/],
];
function inspect(data, location) {
  const text = data.toString("utf8");
  for (const [name, expression] of rules)
    if (expression.test(text)) findings.push({ location, rule: name });
  for (const secret of knownSecrets)
    if (text.includes(secret))
      findings.push({ location, rule: "known-local-secret" });
  for (const raw of text.match(
    /(?:postgres(?:ql)?|mysql|rediss?):\/\/[^\s"'`<>]+/gi,
  ) ?? []) {
    try {
      const password = decodeURIComponent(new URL(raw).password);
      if (password && !placeholder(password))
        findings.push({ location, rule: "database-password-in-url" });
    } catch {
      /* Not a connection string. */
    }
  }
  for (const match of text.matchAll(
    /\b(?:DATABASE_URL|AI_API_KEY|YOUTUBE_API_KEY|SESSION_SECRET|LOCAL_PASSWORD_HASH)\s*[:=]\s*["']([^"'\r\n]+)["']/g,
  )) {
    if (!placeholder(match[1]) && match[1].length >= 16)
      findings.push({ location, rule: "literal-secret-assignment" });
  }
}
const files = git(
  "ls-files",
  "-z",
  "--cached",
  "--others",
  "--exclude-standard",
)
  .toString()
  .split("\0")
  .filter(Boolean);
for (const file of files) {
  if (forbidden(file))
    findings.push({ location: file, rule: "private-file-in-publication" });
  if (existsSync(file) && statSync(file).isFile())
    inspect(readFileSync(file), file);
}
const objects = git("rev-list", "--objects", "--all", "--reflog")
  .toString()
  .split(/\r?\n/)
  .filter(Boolean);
let blobs = 0;
for (const object of objects) {
  const split = object.indexOf(" ");
  if (split < 0) continue;
  const id = object.slice(0, split),
    file = object.slice(split + 1);
  if (forbidden(file))
    findings.push({
      location: `history:${file}`,
      rule: "private-file-in-history",
    });
  try {
    const data = git("cat-file", "blob", id);
    inspect(data, `history:${file}@${id.slice(0, 8)}`);
    blobs++;
  } catch {
    /* Tree objects have no file content. */
  }
}
const unique = [
  ...new Map(
    findings.map((finding) => [`${finding.location}:${finding.rule}`, finding]),
  ).values(),
];
console.log(
  JSON.stringify(
    {
      filesChecked: files.length,
      historyBlobsChecked: blobs,
      findings: unique,
    },
    null,
    2,
  ),
);
if (unique.length) process.exitCode = 1;
