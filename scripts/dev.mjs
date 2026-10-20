// Starts the Next.js app plus the Python Wedding Planning API it proxies to.
// Usage: npm run dev   (all data in Neon Postgres via DATABASE_URL in .env.local)
import { spawn, spawnSync } from "node:child_process";
import nextEnv from "@next/env";

// .env.local is shared with the Python planner, which checks the same sign-in cookie
// (MATRIMONY_SESSION_SECRET) as the Next.js app.
nextEnv.loadEnvConfig(process.cwd(), true);

const PLANNING_PORT = process.env.PLANNING_PORT || "8765";
const python = process.env.PYTHON || (process.platform === "win32" ? "py" : "python3");
const children = [];

function start(command, args, env = {}) {
  const child = spawn(command, args, { stdio: "inherit", env: { ...process.env, ...env }, shell: process.platform === "win32" });
  children.push(child);
  child.on("exit", (code) => {
    if (code && command !== python) shutdown(code);
  });
  return child;
}

function shutdown(code = 0) {
  for (const child of children) if (!child.killed) child.kill();
  process.exit(code);
}
process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());

const env = {};
if (spawnSync(python, ["--version"], { stdio: "ignore", shell: process.platform === "win32" }).status === 0) {
  const args = ["-u", "server.py", "--port", PLANNING_PORT];
  start(python, args);
  env.PLANNING_API_URL = `http://127.0.0.1:${PLANNING_PORT}`;
} else {
  console.warn(`Python (${python}) was not found; Wedding Planning will be unavailable. Set PYTHON to enable it.`);
}

start("npx", ["next", "dev", "--port", process.env.PORT || "4173"], env);
