import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(async ({ mode }) => {
  const plugins = [react(), runtimeErrorOverlay()];

  // Add Replit plugin only in dev + Replit environment
  if (mode !== "production" && process.env.REPL_ID) {
    const cartographer = await import("@replit/vite-plugin-cartographer").then(
      (m) => m.cartographer()
    );
    plugins.push(cartographer);
  }

  return {
    plugins,
    root: path.resolve(__dirname, "client"), // client source folder
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client/src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    build: {
      outDir: path.resolve(__dirname, "dist/public"), // production build output
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
