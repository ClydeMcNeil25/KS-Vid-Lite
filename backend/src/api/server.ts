import express from "express";
import cors from "cors";
import fs from "fs";
import http from "http";
import path from "path";
import multer from "multer";
import { createAutoEdit } from "../pipeline/createAutoEdit";
import { AspectRatio, OutputFps } from "../types/project.types";

const app = express();
const PORT = process.env.PORT || 3001;
const dataDir = process.env.KS_VID_LITE_DATA_DIR
  ? path.resolve(process.env.KS_VID_LITE_DATA_DIR)
  : process.cwd();
const uploadsDir = path.join(dataDir, "uploads");
const tempDir = path.join(dataDir, "temp");
const rendersDir = path.join(tempDir, "renders");

fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(tempDir, { recursive: true });
fs.mkdirSync(rendersDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${Date.now()}-${safeName}`);
    }
  })
});

app.use(cors());
app.use(express.json({ limit: "50mb" }));

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string" && value.trim()) {
    return [value];
  }

  return [];
}

function parseTargetDuration(value: unknown): number | undefined {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function parseAspectRatio(value: unknown): AspectRatio | undefined {
  if (value === "9:16" || value === "1:1" || value === "16:9") {
    return value;
  }

  return undefined;
}

function parseFps(value: unknown): OutputFps | undefined {
  if (typeof value === "number" && (value === 29.97 || value === 30 || value === 60)) {
    return value as OutputFps;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (parsed === 29.97 || parsed === 30 || parsed === 60) {
      return parsed as OutputFps;
    }
  }

  return undefined;
}

function parseBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return fallback;
}

function parseCaptions(value: unknown) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function buildDefaultOutputPath(inputFiles: string[]): string {
  const firstInput = inputFiles[0] ?? "render";
  const baseName = path.parse(firstInput).name || "render";
  const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.join(rendersDir, `${safeName}-${stamp}.mp4`);
}

function isWithinDirectory(targetPath: string, parentDir: string): boolean {
  const relative = path.relative(parentDir, targetPath);
  return !!relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function isManagedTemporaryFile(targetPath: string): boolean {
  return isWithinDirectory(targetPath, tempDir) || targetPath === tempDir;
}

async function cleanupManagedTemporaryFile(targetPath: string) {
  if (!isManagedTemporaryFile(targetPath)) {
    return;
  }

  try {
    await fs.promises.unlink(targetPath);
  } catch {
    // Best-effort cleanup only.
  }
}

async function cleanupUploadedFiles(files: Express.Multer.File[]) {
  await Promise.all(
    files.map(async (file) => {
      try {
        await fs.promises.unlink(file.path);
      } catch {
        // Best-effort cleanup only.
      }
    })
  );
}

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "KS-Vid-Lite API is running"
  });
});

app.get("/download", async (req, res) => {
  const requestedPath =
    typeof req.query.path === "string" ? req.query.path.trim() : "";
  const deleteAfter =
    typeof req.query.deleteAfter === "string" &&
    req.query.deleteAfter.toLowerCase() === "true";

  if (!requestedPath) {
    return res.status(400).json({
      success: false,
      message: "path query parameter is required."
    });
  }

  const resolvedPath = path.resolve(requestedPath);

  try {
    const stat = await fs.promises.stat(resolvedPath);

    if (!stat.isFile()) {
      return res.status(404).json({
        success: false,
        message: "Requested file does not exist."
      });
    }

    return res.download(resolvedPath, async (error) => {
      if (!error && deleteAfter) {
        await cleanupManagedTemporaryFile(resolvedPath);
      }
    });
  } catch {
    return res.status(404).json({
      success: false,
      message: "Requested file does not exist."
    });
  }
});

app.get("/media", async (req, res) => {
  const requestedPath =
    typeof req.query.path === "string" ? req.query.path.trim() : "";

  if (!requestedPath) {
    return res.status(400).json({
      success: false,
      message: "path query parameter is required."
    });
  }

  const resolvedPath = path.resolve(requestedPath);

  try {
    const stat = await fs.promises.stat(resolvedPath);

    if (!stat.isFile()) {
      return res.status(404).json({
        success: false,
        message: "Requested media file does not exist."
      });
    }

    res.type(path.extname(resolvedPath) || ".mp4");
    return res.sendFile(resolvedPath);
  } catch {
    return res.status(404).json({
      success: false,
      message: "Requested media file does not exist."
    });
  }
});

app.post("/auto-edit", (req, res, next) => {
  const contentType = req.headers["content-type"] ?? "";

  if (contentType.includes("multipart/form-data")) {
    upload.array("sourceFiles")(req, res, next);
    return;
  }

  next();
});

app.post("/auto-edit", async (req, res) => {
  const uploadedFiles = ((req.files as Express.Multer.File[] | undefined) ??
    []) as Express.Multer.File[];

  try {
    const manualFiles = asStringArray(req.body.files);
    const uploadedPaths = uploadedFiles.map((file) => file.path);
    const files = [...manualFiles, ...uploadedPaths];
    const targetDuration = parseTargetDuration(req.body.targetDuration);
    const mode =
      typeof req.body.mode === "string" ? req.body.mode : undefined;
    const style =
      typeof req.body.style === "string" ? req.body.style : undefined;
    const aspectRatio = parseAspectRatio(req.body.aspectRatio) ?? "16:9";
    const fps = parseFps(req.body.fps) ?? 30;
    const requestedOutputPath =
      typeof req.body.outputPath === "string" ? req.body.outputPath.trim() : "";
    const temporaryOutput = !requestedOutputPath;
    const outputPath = requestedOutputPath || buildDefaultOutputPath(files);
    const enableOverlays = parseBoolean(req.body.enableOverlays, true);
    const captions = parseCaptions(req.body.captions);

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        stage: "input",
        message: "At least one input file is required."
      });
    }

    if (!targetDuration || typeof targetDuration !== "number") {
      return res.status(400).json({
        success: false,
        stage: "input",
        message: "targetDuration must be a number."
      });
    }

    if (!mode) {
      return res.status(400).json({
        success: false,
        stage: "input",
        message: "mode is required."
      });
    }

    if (!style) {
      return res.status(400).json({
        success: false,
        stage: "input",
        message: "style is required."
      });
    }

    const result = await createAutoEdit({
      files,
      targetDuration,
      mode,
      style,
      outputPath,
      temporaryOutput,
      aspectRatio,
      fps,
      enableOverlays,
      captions
    });

    if (!result.success) {
      return res.status(500).json({
        ...result,
        stage: "pipeline"
      });
    }

    return res.json({
      success: true,
      stage: "complete",
      result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      stage: "server",
      message: error instanceof Error ? error.message : "Unknown server error"
    });
  } finally {
    await cleanupUploadedFiles(uploadedFiles);
  }
});

const server = app.listen(PORT, () => {
  console.log(`KS-Vid-Lite API running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("KS-Vid-Lite API server error:", error);
});

server.on("close", () => {
  console.log("KS-Vid-Lite API server closed.");
});

// Keep the local dev API process alive consistently on Windows shells.
const keepAlive = setInterval(() => {
  if (!(server as http.Server).listening) {
    console.warn("Keepalive noticed the API server is not listening.");
  }
}, 60_000);

function shutdown(signal: string) {
  console.log(`Received ${signal}. Shutting down KS-Vid-Lite API...`);
  clearInterval(keepAlive);
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
