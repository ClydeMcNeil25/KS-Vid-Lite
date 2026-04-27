/**
 * KS-Vid-Lite backend API client.
 *
 * In Vite dev, requests go through the dev proxy so the frontend can call
 * same-origin endpoints like `/auto-edit` and `/health`.
 *
 * For non-dev environments, `VITE_API_BASE` can point at a deployed backend.
 */

const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.DEV ? '' : 'http://localhost:3001');

export const RENDER_ENDPOINT = `${API_BASE}/auto-edit`;
export const HEALTH_ENDPOINT = `${API_BASE}/health`;
export const DOWNLOAD_ENDPOINT = `${API_BASE}/download`;
export const MEDIA_ENDPOINT = `${API_BASE}/media`;

/**
 * POST a render payload to the backend.
 * @param {object} payload - { files, targetDuration, mode, style, outputPath, enableOverlays, captions }
 * @returns {Promise<object>} parsed JSON response from the backend
 */
export async function renderVideo(payload) {
  const isFormData = payload instanceof FormData;
  const res = await fetch(RENDER_ENDPOINT, {
    method: 'POST',
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    body: isFormData ? payload : JSON.stringify(payload),
  });

  return res.json();
}

/**
 * Lightweight reachability probe against the backend health endpoint.
 */
export async function pingBackend(timeoutMs = 2000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(HEALTH_ENDPOINT, { signal: ctrl.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(tid);
  }
}

export async function downloadRenderedVideo(outputPath) {
  const url = new URL(DOWNLOAD_ENDPOINT, window.location.origin);
  url.searchParams.set('path', outputPath);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error('Unable to download rendered video.');
  }

  return res.blob();
}

export function getPreviewVideoUrl(outputPath) {
  const url = new URL(MEDIA_ENDPOINT, window.location.origin);
  url.searchParams.set('path', outputPath);
  return url.toString();
}
