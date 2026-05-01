import { type Express } from "express";
import express from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
    root: path.resolve(__dirname, "../client"),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "../client/src"),
        "@shared": path.resolve(__dirname, "../shared"),
      },
    },
  });

  // Serve static files from dist folder FIRST (before Vite middleware)
  const distPath = path.resolve(__dirname, "../client/dist");
  app.use(express.static(distPath));

  app.use(vite.middlewares);

  app.use(async (req, res, next) => {
    const url = req.originalUrl;

    // Don't handle API routes, Vite HMR
    if (url.startsWith("/api/") || url.startsWith("/@")) {
      return next();
    }

    try {
      // Try to serve from dist first
      const distIndexPath = path.resolve(__dirname, "../client/dist/index.html");
      if (fs.existsSync(distIndexPath)) {
        let template = await fs.promises.readFile(distIndexPath, "utf-8");
        const page = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } else {
        // Fallback to source index.html
        const clientTemplate = path.resolve(
          __dirname,
          "..",
          "client",
          "index.html",
        );
        let template = await fs.promises.readFile(clientTemplate, "utf-8");
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}"`,
        );
        const page = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      }
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
