import express from "express";
import cors from "cors";
import { createAutoEdit } from "../pipeline/createAutoEdit";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "KS-Vid-Lite API is running"
  });
});

app.post("/auto-edit", async (req, res) => {
  try {
    const {
      files,
      targetDuration,
      mode,
      style,
      outputPath,
      enableOverlays,
      captions
    } = req.body;

    if (!Array.isArray(files) || files.length === 0) {
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

    if (!outputPath) {
      return res.status(400).json({
        success: false,
        stage: "input",
        message: "outputPath is required."
      });
    }

    const result = await createAutoEdit({
      files,
      targetDuration,
      mode,
      style,
      outputPath,
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
  }
});

app.listen(PORT, () => {
  console.log(`KS-Vid-Lite API running on http://localhost:${PORT}`);
});