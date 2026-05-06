import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

let didLoad = false;

export function loadEnv() {
  if (didLoad) return;

  const nodeEnv = process.env.NODE_ENV || "development";
  const envFile = path.join(projectRoot, `.env.${nodeEnv}`);
  const fallbackFile = path.join(projectRoot, ".env");

  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
  } else if (fs.existsSync(fallbackFile)) {
    dotenv.config({ path: fallbackFile });
  } else {
    dotenv.config();
  }

  didLoad = true;
}

