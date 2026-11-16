import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// On Vercel, files in /api run as serverless functions. `vite` and `vite preview` don't
// know about them, so this serves the same handlers locally. Without SUPABASE_URL set,
// they use a throwaway in-memory gallery.
const API_ROUTES = new Set(["generate", "portraits", "report", "stars", "stats"]);

function localApi() {
  const handle = async (req, res, next) => {
    const name = new URL(req.url, "http://localhost").pathname.match(/^\/api\/([a-z]+)$/)?.[1];
    if (!name || !API_ROUTES.has(name)) return next();
    if (!process.env.SUPABASE_URL) process.env.DREAMHER_DEV_STORE = "memory";
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
