# Krucial Video Editor — MVP Specification

## 1. Overview

The Krucial Video Editor is a desktop application designed to help content creators quickly transform raw video clips into polished, social-media-ready videos using AI-assisted editing.

The app prioritizes:

* Speed
* Automation
* Simplicity

Users upload clips, select platform and duration, generate an automatic edit, optionally tweak it, and export.

---

## 2. Target Users

* Content creators (TikTok, Reels, Shorts)
* Small businesses
* Social media managers
* Internal Krucial Studios production workflows

---

## 3. Core Value Proposition

> “Upload your clips ? get a finished, social-ready video in seconds.”

The app eliminates the need for manual editing by automating:

* trimming
* stitching
* formatting
* basic transitions

---

## 4. MVP Features

### 4.1 Project Creation

* Create new project
* Assign project name
* Save/load project (JSON-based)

---

### 4.2 Platform Selection

Supported platforms:

* TikTok
* Instagram Reels
* YouTube Shorts
* Facebook Reels

Each platform auto-suggests:

* aspect ratio (default: 9:16)
* recommended duration presets

---

### 4.3 Aspect Ratio Selection

Options:

* 9:16 (default)
* 1:1
* 16:9

---

### 4.4 Duration System

#### Presets:

* 15s
* 30s
* 45s
* 60s
* 90s
* 180s
* Custom

#### Modes:

**Strict Mode**

* Must match target duration exactly
* Blocks generation if invalid

**Smart Mode (default)**

* Attempts to auto-fit duration
* Trims or adjusts clips if needed
* Blocks only on extreme mismatch

**Free Mode**

* No restrictions
* No blocking

---

### 4.5 Media Upload

Users can upload:

* Video clips (required)
* Optional:

  * Audio/music
  * Logos
  * Overlays

UI displays:

* clip thumbnails
* individual durations
* total duration

---

### 4.6 Duration Validation

Occurs immediately after upload and before generation.

#### Rules:

**Too Short**

* Blocks in Strict Mode
* Error message shown

**Too Long**

* Blocks in Strict Mode
* Smart Mode attempts trimming

**Extreme Mismatch**

* Blocks in all modes except Free

#### Example Errors:

* “Not enough footage for selected duration”
* “Too much footage for selected duration”
* “Unable to fit edit within selected duration”

---

### 4.7 Editing Preferences (Optional)

Users may define:

* Style preset:

  * Viral
  * Cinematic
  * Podcast
  * Clean

* Direction input (text):

  * e.g. “fast-paced, highlight best moments, include captions”

---

### 4.8 Auto Edit Generation

Triggered by:
? “Generate Edit” button

System performs:

* clip trimming
* silence/dead space removal (basic)
* clip stitching
* transition application (basic)
* aspect ratio formatting
* timeline creation

Output:

* Draft video edit

---

### 4.9 Draft Review

User can:

* preview video
* view simplified timeline

---

### 4.10 Manual Tweaks (Light Editing)

Users can:

* adjust clip cut points
* reorder clips
* change transitions
* edit captions (if enabled)

Note:
This is NOT a full timeline editor.

---

### 4.11 Export System

Export output:

* MP4 format
* platform-optimized resolution
* correct aspect ratio

---

## 5. Excluded Features (MVP)

The following are NOT included in V1:

* Advanced timeline editing (Premiere-style)
* Color grading tools
* Deep audio editing
* AI-generated video clips
* Complex motion graphics
* Multi-track editing

---

## 6. User Workflow

1. Launch app
2. Create new project
3. Select platform
4. Select aspect ratio
5. Select duration
6. Select mode (Strict / Smart / Free)
7. Upload clips
8. Fix validation issues (if any)
9. Choose style (optional)
10. Enter direction (optional)
11. Click “Generate Edit”
12. Review draft
13. Make optional tweaks
14. Export video

---

## 7. Technical Foundation

### Stack

* Electron (desktop shell)
* React + TypeScript (UI)
* FFmpeg (video processing)
* JSON-based project system

---

### Core Systems

**Project System**

* Stores project.json
* Tracks media, settings, timeline

**Media Engine**

* Handles trimming, merging, resizing

**Timeline Engine**

* Builds structured edit sequence

**Duration Validator**

* Enforces duration rules

**Export Engine**

* Generates final MP4 output

---

## 8. Project File Structure (Per Project)

projects/<project-name>/

* project.json
* source/

  * clips/
  * audio/
  * graphics/
* generated/

  * thumbnails/
  * previews/
  * timeline/
* exports/
* backups/

---

## 9. Key Principles

* Automation first
* User control second
* Speed always
* Minimal friction
* Social-ready output by default

---

## 10. MVP Success Criteria

The MVP is successful when a user can:

* Upload raw clips
* Click “Generate Edit”
* Receive a usable, polished video
* Export without manual editing

---

END OF SPEC
