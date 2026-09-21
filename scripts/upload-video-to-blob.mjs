import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Upload for a single new file — `node scripts/upload-video-to-blob.mjs "name.mp4"`
// (run with --env-file=.env.local) — so adding one video doesn't mean
// re-uploading everything else through upload-videos-to-blob.mjs.
const NAME = process.argv[2];
if (!NAME) {
  console.error("Usage: node scripts/upload-video-to-blob.mjs \"<filename>.mp4\"");
  process.exit(1);
}
const filePath = path.join(process.cwd(), "public", "projecs", NAME);

async function main() {
  const buffer = await readFile(filePath);
  process.stdout.write(`Uploading ${NAME} (${(buffer.length / 1e6).toFixed(1)} MB)... `);
  const blob = await put(`projecs/${NAME}`, buffer, {
    access: "public",
    addRandomSuffix: false,
    multipart: true,
  });
  console.log(blob.url);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
