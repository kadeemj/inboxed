import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import process from "node:process";
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [
    tailwindcss(),
    // SvelteKit 3 takes its config here; svelte.config.js is no longer read.
    sveltekit({
      preprocess: vitePreprocess(),
      // Tauri doesn't have a Node.js server to do proper SSR
      // so we use adapter-static with a fallback to index.html to put the site in SPA mode
      // See: https://svelte.dev/docs/kit/single-page-apps
      // See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
      adapter: adapter({
        fallback: "index.html",
      }),
      // SvelteKit 3 dropped the built-in $lib alias; keep it so imports are unchanged.
      // See: https://svelte.dev/docs/kit/$lib
      alias: { $lib: "src/lib" },
    }),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || "127.0.0.1",
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
