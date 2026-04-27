/**
 * KS-Vid-Lite backend API client.
 */

const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.DEV ? "" : "http://localhost:3001");

export const RENDER_ENDPOINT = `${API_BASE}/auto-edit`;
export const HEALTH_ENDPOINT = `${API_BASE}/health`;
export const DOWNLOAD_ENDPOINT = `${API_BASE}/download`;
export const MEDIA_ENDPOINT = `${API_BASE}/media`;

function buildBackendUrl(endpoint, params = {}) {
  const base =
    API_BASE || `${window.location.protocol}//${window.location.host}`;

  const url = new URL(endpoint, base);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

/**
 * POST a render payload to the backend.
 * @param {object|FormData} payload
 * @returns {Promise<object>}
 */
export async function renderVideo(payload) {
  const isFormData = payload instanceof FormData;

  const res = await fetch(RENDER_ENDPOINT, {
    method: "POST",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? payload : JSON.stringify(payload)
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
  const res = await fetch(
    buildBackendUrl(DOWNLOAD_ENDPOINT, { path: outputPath })
  );

  if (!res.ok) {
    throw new Error("Unable to download rendered video.");
  }

  return res.blob();
}

export function getPreviewVideoUrl(outputPath) {
  return buildBackendUrl(MEDIA_ENDPOINT, { path: outputPath });
}