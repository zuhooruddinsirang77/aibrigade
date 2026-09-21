#!/usr/bin/env bash
# Re-encodes the master videos in public/projecs-originals down to a size
# Vercel Blob's free-tier quota can hold, writing the results into
# public/projecs (the folder scripts/upload-videos-to-blob.mjs reads from).
set -euo pipefail

SRC_DIR="public/projecs-originals"
OUT_DIR="public/projecs"
mkdir -p "$OUT_DIR"

shopt -s nullglob
for f in "$SRC_DIR"/*.mp4; do
  base="$(basename "$f")"
  out="$OUT_DIR/$base"

  dims="$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$f")"
  w="${dims%x*}"
  h="${dims#*x}"

  scale_filter=()
  if [ "$w" -gt 1920 ] || [ "$h" -gt 1920 ]; then
    if [ "$w" -ge "$h" ]; then
      scale_filter=(-vf scale=1920:-2)
    else
      scale_filter=(-vf scale=-2:1920)
    fi
  fi

  echo "=== $base (${w}x${h}) ==="
  ffmpeg -y -i "$f" "${scale_filter[@]}" -c:v libx264 -preset fast -crf 26 -pix_fmt yuv420p \
    -c:a aac -b:a 128k -movflags +faststart "$out" \
    < /dev/null > "$OUT_DIR/$base.log" 2>&1

  orig_size=$(stat -c%s "$f")
  new_size=$(stat -c%s "$out")
  echo "  $((orig_size/1000000))MB -> $((new_size/1000000))MB"
  rm -f "$OUT_DIR/$base.log"
done

echo "DONE"
du -ch "$OUT_DIR"/*.mp4 | tail -1
