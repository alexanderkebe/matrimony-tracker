import { readFileSync } from "node:fs";
import path from "node:path";

// legacy/index.html remains the single source for the page markup while the
// UI is migrated to React screen by screen. It is read on each render so edits
// show up in `next dev`; production prerenders the page once at build time.
export function readLegacyPage() {
  const html = readFileSync(path.join(process.cwd(), "legacy", "index.html"), "utf8");
  const match = (pattern: RegExp, fallback = "") => pattern.exec(html)?.[1]?.trim() ?? fallback;
  return {
    title: match(/<title>([\s\S]*?)<\/title>/i, "Matrimony By Hanna"),
    description: match(/<meta\s+name="description"\s+content="([^"]*)"/i),
    stylesheets: [...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/gi)].map((entry) => "/" + entry[1].replace(/^\.?\//, "")),
    // Includes the original <script> tags, which the browser runs while parsing,
    // exactly as it did when index.html was served directly.
    body: match(/<body[^>]*>([\s\S]*)<\/body>/i)
  };
}
