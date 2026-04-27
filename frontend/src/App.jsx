import { useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import SourcesPanel from './components/SourcesPanel.jsx';
import CenterPanel from './components/CenterPanel.jsx';
import StatusPanel from './components/StatusPanel.jsx';
import {
  downloadRenderedVideo,
  renderVideo,
  pingBackend,
} from './api/render.js';
import {
  clearOutputHandle,
  ensureOutputHandlePermission,
  loadOutputHandle,
  pickOutputHandle,
  saveOutputHandle,
  supportsFileSystemAccess,
  writeBlobToHandle,
  buildSuggestedOutputName,
} from './utils/outputHandleStore.js';

const DEFAULT_OUTPUT =
  'D:/Dropbox/05 Development/KS-Vid-Lite/backend/test-assets/api-test-output.mp4';
const OUTPUT_PATH_STORAGE_KEY = 'ks-vid-lite-output-path';

function nowStamp() {
  const n = new Date();
  return [n.getHours(), n.getMinutes(), n.getSeconds()]
    .map((x) => x.toString().padStart(2, '0'))
    .join(':');
}

export default function App() {
  // ----- Sources -----
  const [files, setFiles] = useState([]);
  const [pickedFiles, setPickedFiles] = useState([]);
  const [outputPath, setOutputPath] = useState('');
  const [outputHandle, setOutputHandle] = useState(null);
  const [outputHandleName, setOutputHandleName] = useState('');
  const [captions, setCaptions] = useState([]);
  const captionIdRef = useRef(0);

  // ----- Config -----
  const [style, setStyle] = useState('viral');
  const [mode, setMode] = useState('smart');
  const [targetDuration, setTargetDuration] = useState(15);
  const [enableOverlays, setEnableOverlays] = useState(true);
  const [enableCaptions, setEnableCaptions] = useState(true);

  // ----- Status / render lifecycle -----
  const [apiOnline, setApiOnline] = useState(null); // null = unknown, true/false after probe
  const [renderState, setRenderState] = useState('idle'); // idle | loading | success | error
  const [statusLabel, setStatusLabel] = useState('IDLE');
  const [statusMsg, setStatusMsg] = useState('Ready to render.');
  const [progress, setProgress] = useState(20);
  const [progressVisible, setProgressVisible] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([
    { ts: '00:00:00', type: 'info', msg: 'KS-Vid-Lite ready.' },
  ]);

  const tickRef = useRef(null);
  const hideProgressTimerRef = useRef(null);

  // ----- Helpers -----
  const log = (msg, type = '') =>
    setLogs((prev) => [...prev, { ts: nowStamp(), type, msg }]);

  const setStatus = (state, label, msg) => {
    setRenderState(state);
    setStatusLabel(label);
    setStatusMsg(msg);
  };

  // ----- Sources actions -----
  const addFile = (path) => {
    const v = path.trim();
    if (!v) return;
    setFiles((prev) => [...prev, v]);
    const leaf = v.split(/[/\\]/).pop();
    log('Added: ' + leaf, 'info');
  };
  const removeFile = (idx) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  const addPickedFiles = (newFiles) => {
    if (!newFiles.length) return;
    setPickedFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => log('Picked: ' + file.name, 'info'));
  };
  const removePickedFile = (idx) =>
    setPickedFiles((prev) => prev.filter((_, i) => i !== idx));

  const chooseOutputFile = async () => {
    if (!supportsFileSystemAccess()) {
      log('Browser save picker is not supported here.', 'err');
      setStatus(
        'error',
        'OUTPUT PICKER',
        'This browser does not support the output file picker.',
      );
      return;
    }

    try {
      const suggestedSource = pickedFiles[0]?.name || files[0] || 'ks-vid-lite-render.mp4';
      const handle = await pickOutputHandle(buildSuggestedOutputName(suggestedSource));
      setOutputHandle(handle);
      setOutputHandleName(handle.name);
      setOutputPath('');
      await saveOutputHandle(handle);
      log(`Output target selected: ${handle.name}`, 'ok');
    } catch (error) {
      if (error?.name !== 'AbortError') {
        log(`Output picker error: ${error.message}`, 'err');
      }
    }
  };

  const clearSavedOutputTarget = async () => {
    setOutputHandle(null);
    setOutputHandleName('');
    await clearOutputHandle();
    log('Cleared saved output target.', 'info');
  };

  const addCaption = () => {
    const id = ++captionIdRef.current;
    setCaptions((prev) => [...prev, { id, text: '', start: 0, end: 5 }]);
  };
  const updateCaption = (id, field, value) =>
    setCaptions((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              [field]: field === 'text' ? value : parseFloat(value) || 0,
            }
          : c,
      ),
    );
  const removeCaption = (id) =>
    setCaptions((prev) => prev.filter((c) => c.id !== id));

  // ----- Derived payload (memoized so JSON.stringify only re-runs on change) -----
  const payload = useMemo(
    () => ({
      files: [...files, ...pickedFiles.map((file) => `[upload] ${file.name}`)],
      targetDuration,
      mode,
      style,
      outputPath: outputPath.trim() || (outputHandleName ? `[save picker] ${outputHandleName}` : ''),
      enableOverlays,
      uploadCount: pickedFiles.length,
      captions: enableCaptions
        ? captions.map(({ text, start, end }) => ({ text, start, end }))
        : [],
    }),
    [
      files,
      pickedFiles,
      targetDuration,
      mode,
      style,
      outputPath,
      outputHandleName,
      enableOverlays,
      enableCaptions,
      captions,
    ],
  );

  const buildRenderBody = () => {
    const normalizedCaptions = enableCaptions
      ? captions.map(({ text, start, end }) => ({ text, start, end }))
      : [];

    if (pickedFiles.length) {
      const formData = new FormData();

      pickedFiles.forEach((file) => {
        formData.append('sourceFiles', file);
      });

      files.forEach((filePath) => {
        formData.append('files', filePath);
      });

      formData.append('targetDuration', String(targetDuration));
      formData.append('mode', mode);
      formData.append('style', style);
      formData.append('enableOverlays', String(enableOverlays));
      formData.append('captions', JSON.stringify(normalizedCaptions));

      if (outputPath.trim()) {
        formData.append('outputPath', outputPath.trim());
      }

      return formData;
    }

    return {
      files: [...files],
      targetDuration,
      mode,
      style,
      outputPath: outputPath.trim() || DEFAULT_OUTPUT,
      enableOverlays,
      captions: normalizedCaptions,
    };
  };

  const persistRenderedOutput = async (resultOutputPath) => {
    if (!outputHandle) return;

    const permitted = await ensureOutputHandlePermission(outputHandle);
    if (!permitted) {
      throw new Error('Permission to write to the selected output file was denied.');
    }

    const renderedBlob = await downloadRenderedVideo(resultOutputPath);
    await writeBlobToHandle(outputHandle, renderedBlob);
    log(`Saved render to ${outputHandle.name}`, 'ok');
  };

  // ----- Render lifecycle -----
  const startRender = async () => {
    if (!files.length && !pickedFiles.length) {
      log('No input files', 'err');
      setStatus('error', 'ERROR', 'Add at least one input file.');
      return;
    }

    setProgressVisible(true);
    setProgress(10);
    setResult(null);
    setStatus('loading', 'RENDERING', 'Sending to FFmpeg pipeline...');
    log(
      `Render - style:${payload.style} mode:${payload.mode} dur:${payload.targetDuration}s`,
      'info',
    );

    // Simulated progress until we get a response.
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 7, 88));
    }, 700);

    try {
      const data = await renderVideo(buildRenderBody());
      clearInterval(tickRef.current);
      tickRef.current = null;
      setProgress(100);

      if (data && data.success) {
        if (data.result?.outputPath && outputHandle && !outputPath.trim()) {
          await persistRenderedOutput(data.result.outputPath);
        }
        setStatus('success', 'COMPLETE', 'Render finished.');
        log('Done -> ' + (data.result?.outputPath || ''), 'ok');
        setResult(data);
      } else {
        const e = data?.error || data?.message || 'Unknown error';
        setStatus('error', 'FAILED', e);
        log('Failed: ' + e, 'err');
      }
    } catch (e) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      setStatus(
        'error',
        'FAILED',
        'Cannot reach localhost:3001 - is the backend running?',
      );
      log('Network error: ' + e.message, 'err');
    } finally {
      // Hide the progress bar after a short delay, mirroring the original UX.
      if (hideProgressTimerRef.current)
        clearTimeout(hideProgressTimerRef.current);
      hideProgressTimerRef.current = setTimeout(() => {
        setProgressVisible(false);
        setProgress(20);
      }, 2500);
    }
  };

  // ----- Mount: ping backend once -----
  useEffect(() => {
    const storedOutputPath = window.localStorage.getItem(OUTPUT_PATH_STORAGE_KEY);
    if (storedOutputPath) {
      setOutputPath(storedOutputPath);
    }

    let cancelled = false;
    (async () => {
      const ok = await pingBackend(2000);
      if (cancelled) return;
      setApiOnline(ok);
      if (ok) log('API reachable', 'ok');
      else log('Backend offline - start server first', 'err');
    })();

    if (supportsFileSystemAccess()) {
      (async () => {
        try {
          const handle = await loadOutputHandle();
          if (!cancelled && handle) {
            setOutputHandle(handle);
            setOutputHandleName(handle.name);
            log(`Restored output target: ${handle.name}`, 'info');
          }
        } catch {
          // Best-effort restore only.
        }
      })();
    }

    return () => {
      cancelled = true;
      if (tickRef.current) clearInterval(tickRef.current);
      if (hideProgressTimerRef.current)
        clearTimeout(hideProgressTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.localStorage.setItem(OUTPUT_PATH_STORAGE_KEY, outputPath);
  }, [outputPath]);

  return (
    <div className="shell">
      <Header apiOnline={apiOnline} />
      <div className="body">
        <SourcesPanel
          files={files}
          pickedFiles={pickedFiles}
          outputPath={outputPath}
          outputHandleName={outputHandleName}
          canPickOutput={supportsFileSystemAccess()}
          captions={captions}
          onAddFile={addFile}
          onRemoveFile={removeFile}
          onAddPickedFiles={addPickedFiles}
          onRemovePickedFile={removePickedFile}
          onSetOutputPath={setOutputPath}
          onChooseOutputFile={chooseOutputFile}
          onClearOutputTarget={clearSavedOutputTarget}
          onAddCaption={addCaption}
          onUpdateCaption={updateCaption}
          onRemoveCaption={removeCaption}
        />
        <CenterPanel
          style={style}
          mode={mode}
          targetDuration={targetDuration}
          enableOverlays={enableOverlays}
          enableCaptions={enableCaptions}
          renderState={renderState}
          result={result}
          onSetStyle={setStyle}
          onSetMode={setMode}
          onSetTargetDuration={setTargetDuration}
          onSetEnableOverlays={setEnableOverlays}
          onSetEnableCaptions={setEnableCaptions}
          onRender={startRender}
        />
        <StatusPanel
          renderState={renderState}
          statusLabel={statusLabel}
          statusMsg={statusMsg}
          progress={progress}
          progressVisible={progressVisible}
          result={result}
          payload={payload}
          logs={logs}
        />
      </div>
    </div>
  );
}
