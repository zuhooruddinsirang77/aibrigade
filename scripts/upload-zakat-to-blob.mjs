import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import path from "node:path";

// One-off upload for a single new file, so adding one video doesn't mean
// re-uploading the other sixteen through upload-videos-to-blob.mjs.
const NAME = "zakat.mp4";
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
