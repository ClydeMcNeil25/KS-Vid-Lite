const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const waitOn = require("wait-on");

let backendProcess;
let frontendProcess;
let splashWindow;
let mainWindow;

function startBackend() {
  backendProcess = spawn("npm", ["run", "start"], {
    cwd: path.join(__dirname, "..", "backend"),
    shell: true,
    stdio: "inherit"
  });
}

function startFrontend() {
  frontendProcess = spawn("npm", ["run", "dev"], {
    cwd: path.join(__dirname, "..", "frontend"),
    shell: true,
    stdio: "inherit"
  });
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    backgroundColor: "#0f0f14",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const logoPath = path.join(__dirname, "assets", "ks-logo-purple.png");
  const logoBase64 = fs.readFileSync(logoPath).toString("base64");

  const splashHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>KS-Vid-Lite</title>
        <style>
          body {
            margin: 0;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(circle at top, #2b145f, #0f0f14 65%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            overflow: hidden;
          }

          .card {
            text-align: center;
            color: white;
          }

          .logo-img {
            width: 120px;
            height: auto;
            display: block;
            margin: 0 auto 20px auto;
            filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.6));
          }

          .title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .tagline {
            font-size: 14px;
            color: #c9b8ff;
            margin-bottom: 25px;
          }

          .loader {
            width: 220px;
            height: 6px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 999px;
            overflow: hidden;
            margin: 0 auto;
          }

          .bar {
            height: 100%;
            width: 45%;
            background: #8b5cf6;
            border-radius: 999px;
            animation: loading 1.2s infinite ease-in-out;
          }

          .status {
            margin-top: 15px;
            font-size: 12px;
            color: #aaa;
          }

          @keyframes loading {
            0% {
              transform: translateX(-120%);
            }
            100% {
              transform: translateX(260%);
            }
          }
        </style>
      </head>

      <body>
        <div class="card">
          <img src="data:image/png;base64,${logoBase64}" class="logo-img" />
          <div class="title">KS-Vid-Lite</div>
          <div class="tagline">AI-Assisted Video Editing Engine</div>

          <div class="loader">
            <div class="bar"></div>
          </div>

          <div class="status">Initializing backend & interface...</div>
        </div>
      </body>
    </html>
  `;

  splashWindow.loadURL(
    "data:text/html;charset=utf-8," + encodeURIComponent(splashHtml)
  );
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "KS-Vid-Lite",
    backgroundColor: "#0f0f14",
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.maximize();
  mainWindow.loadURL("http://localhost:5173");

  mainWindow.once("ready-to-show", () => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }

    mainWindow.show();
  });
}

app.whenReady().then(async () => {
  createSplashWindow();

  startBackend();
  startFrontend();

  try {
    await waitOn({
      resources: ["http://localhost:3001/health", "http://localhost:5173"],
      timeout: 30000
    });

    createMainWindow();
  } catch (error) {
    console.error("Failed to start KS-Vid-Lite services:", error);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  if (frontendProcess) frontendProcess.kill();

  if (process.platform !== "darwin") {
    app.quit();
  }
});