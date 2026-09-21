import { put } from "@vercel/blob";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

// Reads from public/projecs, which is gitignored (see .gitignore) and
// populated by scripts/compress-videos.sh from public/projecs-originals.
const DIR = path.join(process.cwd(), "public", "projecs");

async function main() {
  const entries = await readdir(DIR, { withFileTypes: true });
  const videos = entries.filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".mp4"));

  const results = {};
  for (const entry of videos) {
    const filePath = path.join(DIR, entry.name);
    const buffer = await readFile(filePath);
    process.stdout.write(`Uploading ${entry.name} (${(buffer.length / 1e6).toFixed(1)} MB)... `);
    const blob = await put(`projecs/${entry.name}`, buffer, {
      access: "public",
      addRandomSuffix: false,
      multipart: true,
    });
    console.log(blob.url);
    results[entry.name] = blob.url;
  }

  console.log("\n--- JSON map ---");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
