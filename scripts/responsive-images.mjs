// Generates smaller WebP copies of the site's photos so phones don't download
// full-size images. Copies go to public/_responsive/ (gitignored) and the Worker
// serves them for /_vinext/image requests. Unchanged images are skipped.
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

export const RESPONSIVE_WIDTHS = [640, 1080];
const SOURCE = "public/images";
const OUTPUT = "public/_responsive/images";

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.(webp|jpe?g|png)$/i.test(entry.name)) yield path;
  }
}

function imageWidth(path) {
  return Number(execFileSync("magick", ["identify", "-format", "%w", `${path}[0]`]).toString());
}

let made = 0;
for (const source of walk(SOURCE)) {
  const width = imageWidth(source);
  const base = relative(SOURCE, source).replace(/\.[^.]+$/, "");
  for (const target of RESPONSIVE_WIDTHS) {
    if (target >= width) continue;
    const output = join(OUTPUT, `${base}-${target}.webp`);
    try {
      if (statSync(output).mtimeMs >= statSync(source).mtimeMs) continue;
    } catch {
      // Not generated yet.
    }
    mkdirSync(dirname(output), { recursive: true });
    execFileSync("magick", [source, "-resize", `${target}x`, "-strip", "-quality", "78", output]);
    made += 1;
  }
}
console.log(`responsive-images: ${made} new copies`);
