const DB_NAME = 'ks-vid-lite-storage';
const STORE_NAME = 'handles';
const OUTPUT_HANDLE_KEY = 'output-handle';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, callback) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = callback(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
}

export function supportsFileSystemAccess() {
  return (
    typeof window !== 'undefined' &&
    'showSaveFilePicker' in window &&
    'indexedDB' in window
  );
}

export function buildSuggestedOutputName(sourceName = 'ks-vid-lite-render.mp4') {
  const trimmed = sourceName.trim() || 'ks-vid-lite-render.mp4';
  if (trimmed.toLowerCase().endsWith('.mp4')) {
    return trimmed;
  }

  return `${trimmed}.mp4`;
}

export async function pickOutputHandle(suggestedName) {
  return window.showSaveFilePicker({
    suggestedName: buildSuggestedOutputName(suggestedName),
    types: [
      {
        description: 'MP4 video',
        accept: {
          'video/mp4': ['.mp4'],
        },
      },
    ],
  });
}

export async function saveOutputHandle(handle) {
  return withStore('readwrite', (store) => store.put(handle, OUTPUT_HANDLE_KEY));
}

export async function loadOutputHandle() {
  return withStore('readonly', (store) => store.get(OUTPUT_HANDLE_KEY));
}

export async function clearOutputHandle() {
  return withStore('readwrite', (store) => store.delete(OUTPUT_HANDLE_KEY));
}

export async function ensureOutputHandlePermission(handle) {
  if (!handle?.queryPermission) return false;

  const readwrite = { mode: 'readwrite' };
  if ((await handle.queryPermission(readwrite)) === 'granted') {
    return true;
  }

  return (await handle.requestPermission(readwrite)) === 'granted';
}

export async function writeBlobToHandle(handle, blob) {
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}
