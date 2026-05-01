import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "clips");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export interface ProcessingOptions {
  sourceUrl?: string;
  sourcePath?: string;
  startTime: number;
  endTime: number;
  format: "square" | "vertical" | "landscape";
  overlayText?: string;
  verseReference?: string;
  title: string;
}

export interface ProcessingResult {
  success: boolean;
  outputPath?: string;
  outputUrl?: string;
  error?: string;
}

function getVideoDimensions(format: "square" | "vertical" | "landscape") {
  switch (format) {
    case "square":
      return { width: 1080, height: 1080 };
    case "vertical":
      return { width: 1080, height: 1920 };
    case "landscape":
      return { width: 1920, height: 1080 };
  }
}

function getYoutubeDlUrl(videoUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const { exec } = require("child_process");
    const cmd = `yt-dlp -f best -g "${videoUrl}"`;
    exec(cmd, (error: Error | null, stdout: string) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

export async function processVideoClip(options: ProcessingOptions): Promise<ProcessingResult> {
  const { sourceUrl, sourcePath, startTime, endTime, format, overlayText, verseReference, title } = options;
  const duration = endTime - startTime;
  const { width, height } = getVideoDimensions(format);
  
  const outputFilename = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.mp4`;
  const outputPath = path.join(UPLOAD_DIR, outputFilename);
  const outputUrl = `/uploads/clips/${outputFilename}`;

  try {
    let videoSource = sourcePath || sourceUrl;

    if (!videoSource) {
      throw new Error("No video source provided");
    }

    if (sourceUrl && (sourceUrl.includes("youtube.com") || sourceUrl.includes("youtu.be"))) {
      console.log("Downloading from YouTube...");
      try {
        videoSource = await getYoutubeDlUrl(sourceUrl);
      } catch (ytError) {
        console.error("Failed to get YouTube URL, trying direct URL:", ytError);
        if (sourceUrl.startsWith("http")) {
          videoSource = sourceUrl;
        }
      }
    }

    return new Promise((resolve, reject) => {
      let command = ffmpeg(videoSource)
        .setStartTime(startTime)
        .setDuration(duration)
        .videoCodec("libx264")
        .audioCodec("aac")
        .size(`${width}x${height}`)
        .videoFilters([
          "-vf", `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`
        ]);

      if (overlayText || verseReference) {
        const drawText: string[] = [];
        if (verseReference) {
          drawText.push(`text='${verseReference}':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=h-100:box=1:boxcolor=black@0.5:boxborderw=10`);
        }
        if (overlayText) {
          const escapedText = overlayText.replace(/'/g, "\\'").replace(/:/g, "\\:");
          drawText.push(`text='${escapedText}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.5:boxborderw=10`);
        }
        command = command.videoFilter(drawText.join(","));
      }

      command
        .outputOptions([
          "-preset fast",
          "-crf 23",
        ])
        .output(outputPath)
        .on("start", (cmdLine: string) => {
          console.log("FFmpeg started:", cmdLine);
        })
        .on("progress", (progress: { percent?: number }) => {
          if (progress.percent) {
            console.log(`Processing: ${progress.percent.toFixed(1)}%`);
          }
        })
        .on("end", () => {
          console.log("Video processing complete!");
          resolve({
            success: true,
            outputPath,
            outputUrl,
          });
        })
        .on("error", (err: Error) => {
          console.error("FFmpeg error:", err.message);
          reject(err);
        })
        .run();
    });
  } catch (error) {
    console.error("Video processing error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function getClipUrl(clipId: number): string {
  return `/api/sermon-clips/${clipId}/download`;
}
