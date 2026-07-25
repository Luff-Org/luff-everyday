/**
 * End-to-end API smoke test against a running dev/prod server.
 *
 *   npm run dev            # in another terminal
 *   npm run smoke          # node --env-file=.env scripts/smoke-api.mjs
 *
 * Registers a throwaway credentials user, exercises every /api route (including the
 * dependency, recurrence and validation paths), then deletes that user — the cascade
 * removes every row it created. Needs DATABASE_URL/DIRECT_URL for that cleanup.
 *
 * Env: BASE_URL (default http://localhost:3000).
 */
import { PrismaClient } from "@prisma/client";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const USERNAME = `smoke_${Math.random().toString(36).slice(2, 8)}`;
const EMAIL = `${USERNAME}@smoke.local`;
const PASSWORD = "smoke-password-123";

let cookie = "";
let failures = 0;

function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label} — got ${actual}, expected ${expected}`);
}

function absorbCookies(res) {
  for (const raw of res.headers.getSetCookie?.() ?? []) {
    const pair = raw.split(";")[0];
    const name = pair.split("=")[0];
    cookie = cookie
      .split("; ")
      .filter((part) => part && !part.startsWith(`${name}=`))
      .concat(pair)
      .join("; ");
  }
}

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { cookie, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  absorbCookies(res);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text.slice(0, 200);
  }
  return { status: res.status, json };
}

async function login() {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  absorbCookies(csrfRes);
  const { csrfToken } = await csrfRes.json();
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { cookie, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: USERNAME, password: PASSWORD, csrfToken, json: "true" }),
    redirect: "manual",
  });
  absorbCookies(res);
}

async function main() {
  console.log(`smoke: ${BASE} as ${USERNAME}\n`);

  // ── auth ──
  check("GET /api/todos unauthenticated", (await call("GET", "/api/todos")).status, 401);
  check(
    "POST /api/auth/register",
    (await call("POST", "/api/auth/register", { username: USERNAME, email: EMAIL, password: PASSWORD })).status,
    200,
  );
  check(
    "POST /api/auth/register duplicate email",
    (await call("POST", "/api/auth/register", { username: `${USERNAME}x`, email: EMAIL, password: PASSWORD })).status,
    409,
  );
  check(
    "POST /api/auth/register invalid input",
    (await call("POST", "/api/auth/register", { username: "ab", email: "x", password: "short" })).status,
    400,
  );

  await login();
  const session = await call("GET", "/api/auth/session");
  check("GET /api/auth/session has user id", typeof session.json?.user?.id, "string");

  // ── todos: create ──
  const created = await call("POST", "/api/todos", {
    raw: "write docs tomorrow !urgent #smoke",
    links: [{ url: "https://example.com", title: "ref" }],
  });
  check("POST /api/todos (quick-add)", created.status, 200);
  check("quick-add parsed priority", created.json.priority, "URGENT");
  check("quick-add parsed due date", typeof created.json.dueDate, "string");
  check("quick-add parsed tag", created.json.tags.length, 1);
  check("links attached", created.json.links.length, 1);
  const todoId = created.json.id;

  const blocker = await call("POST", "/api/todos", { title: "blocker task" });
  check("POST /api/todos (explicit title)", blocker.status, 200);
  const blockerId = blocker.json.id;

  check("POST /api/todos empty title", (await call("POST", "/api/todos", { title: "" })).status, 400);

  // ── dependencies ──
  check("PATCH dependsOn", (await call("PATCH", `/api/todos/${todoId}`, { dependsOn: [blockerId] })).status, 200);
  check("complete while blocked", (await call("POST", `/api/todos/${todoId}/complete`)).status, 409);
  check("cycle rejected", (await call("PATCH", `/api/todos/${blockerId}`, { dependsOn: [todoId] })).status, 409);
  check("self-dependency filtered", (await call("PATCH", `/api/todos/${todoId}`, { dependsOn: [todoId] })).status, 200);
  check("unknown blocker rejected", (await call("PATCH", `/api/todos/${todoId}`, { dependsOn: ["nope"] })).status, 400);
  check("dependsOn restored", (await call("PATCH", `/api/todos/${todoId}`, { dependsOn: [blockerId] })).status, 200);

  // ── subtasks ──
  const subtask = await call("POST", `/api/todos/${todoId}/subtasks`, { title: "sub one" });
  check("POST subtask", subtask.status, 200);
  const subtaskId = subtask.json.id;
  check(
    "PATCH subtask",
    (await call("PATCH", `/api/todos/${todoId}/subtasks/${subtaskId}`, { completed: true })).status,
    200,
  );
  check("DELETE subtask", (await call("DELETE", `/api/todos/${todoId}/subtasks/${subtaskId}`)).status, 200);

  // ── recurrence + completion ──
  check(
    "PATCH recurrence DAILY",
    (await call("PATCH", `/api/todos/${blockerId}`, { recurrence: "DAILY", dueDate: new Date().toISOString() })).status,
    200,
  );
  const completedBlocker = await call("POST", `/api/todos/${blockerId}/complete`);
  check("complete recurring blocker", completedBlocker.status, 200);
  check("next occurrence spawned", typeof completedBlocker.json.next?.id, "string");
  check("complete after unblock", (await call("POST", `/api/todos/${todoId}/complete`)).status, 200);

  // ── tags, reorder, list ──
  check("GET /api/todos/tags", (await call("GET", "/api/todos/tags")).status, 200);
  check("POST /api/todos/tags", (await call("POST", "/api/todos/tags", { name: "smoke2" })).status, 200);
  check(
    "POST /api/todos/reorder",
    (await call("POST", "/api/todos/reorder", { items: [{ id: todoId, order: 3 }] })).status,
    200,
  );
  const list = await call("GET", "/api/todos");
  check("GET /api/todos count", list.json.length, 3); // original + blocker + spawned occurrence

  // ── typing + profile ──
  check(
    "POST /api/tests",
    (await call("POST", "/api/tests", { wpm: 80, rawWpm: 85, accuracy: 96.5, duration: 30 })).status,
    200,
  );
  check("POST /api/tests invalid", (await call("POST", "/api/tests", { wpm: -1 })).status, 400);
  const profile = await call("GET", "/api/profile");
  check("GET /api/profile", profile.status, 200);
  check("profile 7-day buckets", profile.json.todos.completedLast7Days.length, 7);
  check("profile typing totals", profile.json.typing.totalTests, 1);

  // ── deletes + ownership ──
  check("DELETE /api/todos/{id}", (await call("DELETE", `/api/todos/${todoId}`)).status, 200);
  check("DELETE unknown id", (await call("DELETE", "/api/todos/does-not-exist")).status, 404);
  check("PATCH unknown id", (await call("PATCH", "/api/todos/does-not-exist", { title: "x" })).status, 404);
}

async function cleanup() {
  // Direct (unpooled) URL: pooled connections can be cold right after a compute restart.
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL } },
  });
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { count } = await prisma.user.deleteMany({ where: { username: USERNAME } });
      console.log(`\ncleanup: deleted ${count} smoke user (cascades all its rows)`);
      break;
    } catch (err) {
      console.log(`cleanup attempt ${attempt} failed: ${String(err.message).split("\n").find((l) => l.includes("reach")) ?? err.name}`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  await prisma.$disconnect();
}

try {
  await main();
} catch (err) {
  failures++;
  console.error("\nsmoke run threw:", err.message);
} finally {
  await cleanup();
}

console.log(failures === 0 ? "\nAll smoke checks passed." : `\n${failures} smoke check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
