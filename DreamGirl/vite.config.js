import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// On Vercel, files in /api run as serverless functions. `vite` and `vite preview` don't
// know about them, so this serves the same handlers locally. Without SUPABASE_URL set,
// they use a throwaway in-memory gallery.
const API_ROUTES = new Set(["deal", "generate", "portraits", "report", "stars", "stats"]);

// Local only: DREAMHER_SEED_DIR=<folder with seed.json + pictures> fills the in-memory
// gallery at start, e.g. with model test pictures. Entries: {file, username, caption,
// style, model, cost_micro, list_micro}.
let seeding = null;
function seedLocalGallery() {
  const dir = process.env.DREAMHER_SEED_DIR;
  if (!dir || process.env.SUPABASE_URL) return null;
  seeding ??= (async () => {
    const { readFile } = await import("node:fs/promises");
    const { default: sharp } = await import("sharp");
    const { getStore } = await import(pathToFileURL(resolve(__dirname, "api", "_lib", "store.js")).href);
    const store = getStore();
    const entries = JSON.parse(await readFile(resolve(dir, "seed.json"), "utf8"));
    for (const [n, e] of entries.entries()) {
      const bytes = await sharp(await readFile(resolve(dir, e.file))).webp({ quality: 82 }).toBuffer();
      const image = await store.uploadImage(`seed-${n}`, bytes, "image/webp");
      const { file, ...row } = e;
      await store.insert({ ...row, id: `seed-${n}`, image_url: image.url, storage_path: image.path, delete_token_hash: "-", ip_hash: `seed-${file}` });
    }
    console.log(`[dev] seeded ${entries.length} portraits into the local gallery`);
  })().catch((e) => console.error("[dev] seeding failed", e));
  return seeding;
}

function localApi() {
  const handle = async (req, res, next) => {
    const name = new URL(req.url, "http://localhost").pathname.match(/^\/api\/([a-z]+)$/)?.[1];
    if (!name || !API_ROUTES.has(name)) return next();
    if (!process.env.SUPABASE_URL) process.env.DREAMHER_DEV_STORE = "memory";
    await seedLocalGallery();
    try {
      const mod = await import(pathToFileURL(resolve(__dirname, "api", `${name}.js`)).href);
      await mod.default(req, res);
    } catch (e) {
      next(e);
    }
  };
  return {
    name: "dreamher-local-api",
    // Block bodies on purpose: a returned function would be treated as a post-middleware hook.
    configureServer(server) {
      server.middlewares.use(handle);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle);
    },
  };
}

export default defineConfig({
  plugins: [react(), localApi()],
});
