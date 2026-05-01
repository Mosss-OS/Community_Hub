import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "client", "dist");
  if (!fs.existsSync(distPath)) {
    console.warn(
      `Could not find the build directory: ${distPath}, client static files will not be served`,
    );
    return;
  }

  app.use(express.static(distPath));

  const uploadsPath = path.resolve(__dirname, "..", "uploads");
  if (fs.existsSync(uploadsPath)) {
    app.use("/uploads", express.static(uploadsPath));
  }

  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
