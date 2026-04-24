# KS-Vid-Lite

KS-Vid-Lite is an AI-assisted desktop video editing tool designed to help creators quickly turn raw video clips into polished, social media–ready content.

Built with speed and simplicity in mind, KS-Vid-Lite focuses on automating the most time-consuming parts of the editing process—cutting, trimming, stitching, and formatting—while still allowing users to make quick adjustments before exporting.

## 🎯 Purpose

Modern content creators juggle multiple roles: filming, editing, posting, and managing their brand. KS-Vid-Lite exists to reduce the editing burden by providing a streamlined workflow that produces clean, ready-to-publish videos with minimal effort.

## ⚙️ Core Workflow

1. Upload video clips
2. Select platform (TikTok, Reels, Shorts, etc.)
3. Choose aspect ratio and duration
4. Generate an automatic edit
5. Optionally tweak the result
6. Export a finished video

## 🚀 Key Features (Alpha)

* Multi-file video ingest and metadata extraction
* Duration validation system (Strict / Smart / Free modes)
* Automatic clip trimming and sequencing (in progress)
* Platform-aware formatting for social media
* Lightweight editing workflow with optional user control

## 🧠 Philosophy

* Automation first
* Control second
* Speed always

KS-Vid-Lite is not intended to replace full-scale editors like Premiere Pro or Final Cut. Instead, it serves as a fast, efficient tool for producing short-form content without the overhead of traditional editing software.

## 🧪 Status

This project is currently in **alpha development**, with active testing and iteration underway. Features are being built incrementally with a focus on stability, performance, and real-world usability.

## 🔮 Vision

KS-Vid-Lite is the foundation for a broader ecosystem of creator tools under Krucial Studios, aimed at simplifying content production through intelligent automation.

# KS-Vid-Lite — Devlog

## Version: v0.4a (Pre-Alpha)

## Date: April 2026

---

## 🧠 Overview

KS-Vid-Lite has officially entered its **pre-alpha development phase**. This stage focuses on building the foundational backend systems that will power the application’s automated video editing workflow.

The goal of this phase is not a complete product, but a **functional core engine** capable of ingesting media, analyzing it, and enforcing structured editing rules.

---

## ⚙️ Systems Implemented

### 📁 Project Structure Initialization

* Established backend architecture using Node.js + TypeScript
* Organized core modules:

  * media
  * duration
  * types
  * config
  * api

---

### 🎞️ Media Metadata Extraction

* Implemented FFprobe integration via `fluent-ffmpeg`
* System can now:

  * read video files
  * extract duration
  * extract resolution (width/height)
* First successful real-world video ingestion completed

---

### 📦 Multi-File Media Ingest

* Built `importMedia` system
* Supports:

  * multiple video file inputs
  * asynchronous metadata extraction
  * structured output array for downstream systems

---

### ⏱️ Duration Validation Engine

* Implemented core validation logic with 3 modes:

  * **Strict Mode** → exact duration enforcement
  * **Smart Mode** → flexible auto-fit rules
  * **Free Mode** → unrestricted editing

* Handles:

  * insufficient footage detection
  * excessive footage detection
  * extreme mismatch blocking

---

### 🧩 Platform Profiles

* Defined platform-specific configurations:

  * TikTok
  * Instagram Reels
  * YouTube Shorts
  * Facebook Reels

* Includes:

  * default aspect ratios
  * recommended durations
  * auto-trim thresholds

---

## 🧪 Testing & Debugging

* Verified metadata extraction with real video files
* Resolved:

  * TypeScript module declaration issues (`ffprobe-static`)
  * Windows path formatting issues
  * ts-node runtime configuration (`--files` flag)
  * script execution mismatches

---

## 🧱 Current Capabilities

KS-Vid-Lite can now:

* Ingest multiple video clips
* Extract real metadata (duration + resolution)
* Validate footage against target duration rules
* Return structured media data for processing

---

## 🚧 In Progress / Next Steps

### 🔹 Immediate

* Connect media ingest → duration validation pipeline
* Build unified ingest + validation API

### 🔹 Upcoming

* Timeline generation system
* Basic clip sequencing logic
* FFmpeg trimming and stitching pipeline
* Draft video rendering

---

## 🎯 Development Focus

This phase is focused on **backend reliability and structure**, ensuring that:

* data flows are clean and predictable
* systems are modular and scalable
* core logic is stable before UI integration

---

## 🔮 Notes

KS-Vid-Lite is currently in a **pre-alpha state**.
Major functionality is still under development, and no user-facing interface has been implemented yet.

This phase lays the groundwork for:

* automated editing workflows
* AI-assisted sequencing
* fast, social-ready video output

---

## 🚀 Closing

v0.4a marks the transition from concept to system.

The foundation is now in place.
Next phase: turning logic into actual video output.
