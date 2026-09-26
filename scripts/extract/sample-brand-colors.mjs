import sharp from "sharp";
import { readdirSync } from "node:fs";
import path from "node:path";

const brands = ["shrichakradhar", "ignouquestionpaper", "ignousolvedassignment", "ignoustudymaterial"];

function toHex(n) {
  return Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
}

async function sampleBrand(brand) {
  const dir = path.join("public", "products", brand);
  let files;
  try {
    files = readdirSync(dir).filter((f) => !f.includes("handwritten"));
  } catch {
    return null;
  }
  // Sample a spread of files, not just the first N alphabetically.
  const sample = files.filter((_, i) => i % Math.max(1, Math.floor(files.length / 40)) === 0).slice(0, 40);

  const buckets = new Map();
  for (const file of sample) {
    try {
      const { data, info } = await sharp(path.join(dir, file))
        .resize(60, 60, { fit: "inside" })
        .raw()
        .toBuffer({ resolveWithObject: true });
      for (let i = 0; i < data.length; i += info.channels) {
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2];
        const max = Math.max(r, g, b),
          min = Math.min(r, g, b);
        if (max - min < 45) continue; // skip grays/white/black/near-neutral
        if (max < 60) continue; // skip near-black
        const key = [Math.round(r / 15) * 15, Math.round(g / 15) * 15, Math.round(b / 15) * 15].join(",");
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
    } catch {
      continue;
    }
  }

  const sorted = Array.from(buckets.entries()).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return null;
  const [r, g, b] = sorted[0][0].split(",").map(Number);
  return { hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`, sampleSize: sample.length, top: sorted.slice(0, 3) };
}

for (const brand of brands) {
  const result = await sampleBrand(brand);
  console.log(brand, result);
}
