/**
 * KS-Vid-Lite — backend API client.
 *
 * The Express backend listens on http://localhost:3001/auto-edit.
 * Make sure CORS is enabled on the backend (e.g.
 *   import cors from 'cors';
 *   app.use(cors({ origin: '*' }));
 * ) so the dev server (Vite, port 5173) can talk to it.
 */

export const API_BASE = 'http://localhost:3001';
export const RENDER_ENDPOINT = `${API_BASE}/auto-edit`;

/**
 * POST a render payload to the backend.
 * @param {object} payload - { files, targetDuration, mode, style, outputPath, enableOverlays, captions }
 * @returns {Promise<object>} parsed JSON response from the backend
 */
export async function renderVideo(payload) {
  const res = await fetch(RENDER_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

/**
 * Lightweight reachability probe — sends a 2s OPTIONS preflight to the
 * render endpoint. Resolves true if the backend responds, false otherwise.
 */
export async function pingBackend(timeoutMs = 2000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    await fetch(RENDER_ENDPOINT, { method: 'OPTIONS', signal: ctrl.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(tid);
  }
}
