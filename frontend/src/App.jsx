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
  hasOutputHandlePermission,
  loadOutputHandle,
  pickOutputHandle,
  saveOutputHandle,
  supportsFileSystemAccess,
  writeBlobToHandle,
  buildSuggestedOutputName,
} from './utils/outputHandleStore.js';

const DEFAULT_OUTPUT =
  'D:/Dropbox/05 Development/KS-Vid-Lite/output/ks-vid-lite-render.mp4';
const OUTPUT_PATH_STORAGE_KEY = 'ks-vid-lite-output-path';
const HELP_MODE_STORAGE_KEY = 'ks-vid-lite-help-enabled';
const DURATION_STEP_STORAGE_KEY = 'ks-vid-lite-fine-duration-steps';
const PREVIEW_SIZE_STORAGE_KEY = 'ks-vid-lite-preview-expanded';

function nowStamp() {
  const n = new Date();
  return [n.getHours(), n.getMinutes(), n.getSeconds()]
    .map((x) => x.toString().padStart(2, '0'))
    .join(':');
}

function formatElapsed(ms) {
  if (!ms || ms < 0) return '0.0s';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function roundToNearestFive(value) {
  return Math.max(5, Math.round(value / 5) * 5);
}

function getPreviewAspectRatio(aspectRatio) {
  switch (aspectRatio) {
    case '9:16':
      return '9 / 16';
    case '1:1':
      return '1 / 1';
    case '16:9':
    default:
      return '16 / 9';
  }
}

function getRenderGuidance(data) {
  const raw = data?.error || data?.message || 'Unknown error.';
  const errorCode = data?.validation?.error || '';

  if (errorCode === 'EXTREME_LONG' || /too much footage/i.test(raw)) {
    return `${raw} Try a longer target duration, switch to Free mode, or use fewer/shorter clips.`;
  }

  if (errorCode === 'EXTREME_SHORT' || /too little footage|not enough footage/i.test(raw)) {
    return `${raw} Try a shorter target duration, switch to Free mode, or add more clips.`;
  }

  if (/targetduration/i.test(raw)) {
    return `${raw} Adjust the target duration and try again.`;
  }

  return raw;
}

export default function App() {
  // ----- Sources -----
  const [pickedFiles, setPickedFiles] = useState([]);
  const [outputPath, setOutputPath] = useState('');
  const [outputHandle, setOutputHandle] = useState(null);
  const [outputHandleName, setOutputHandleName] = useState('');
  const [captions, setCaptions] = useState([]);
  const [helpEnabled, setHelpEnabled] = useState(true);
  const captionIdRef = useRef(0);

  // ----- Config -----
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [style, setStyle] = useState('viral');
  const [mode, setMode] = useState('smart');
  const [fps, setFps] = useState(30);
  const [targetDuration, setTargetDuration] = useState(15);
  const [fineDurationSteps, setFineDurationSteps] = useState(false);
  const [enableOverlays, setEnableOverlays] = useState(true);
  const [enableCaptions, setEnableCaptions] = useState(true);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  // ----- Status / render lifecycle -----
  const [apiOnline, setApiOnline] = useState(null); // null = unknown, true/false after probe
  const [renderState, setRenderState] = useState('idle'); // idle | loading | success | error
  const [statusLabel, setStatusLabel] = useState('IDLE');
  const [statusMsg, setStatusMsg] = useState('Ready to render.');
  const [progress, setProgress] = useState(20);
  const [progressVisible, setProgressVisible] = useState(false);
  const [result, setResult] = useState(null);
  const [renderElapsedMs, setRenderElapsedMs] = useState(null);
  const [logs, setLogs] = useState([
    { ts: '00:00:00', type: 'info', msg: 'KS-Vid-Lite ready.' },
  ]);

  const tickRef = useRef(null);
  const hideProgressTimerRef = useRef(null);
  const renderStartedAtRef = useRef(null);

  // ----- Helpers -----
  const log = (msg, type = '') =>
    setLogs((prev) => [...prev, { ts: nowStamp(), type, msg }]);

  const setStatus = (state, label, msg) => {
    setRenderState(state);
    setStatusLabel(label);
    setStatusMsg(msg);
  };

  // ----- Sources actions -----
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
      const suggestedSource = pickedFiles[0]?.name || 'ks-vid-lite-render.mp4';
      const handle = await pickOutputHandle(buildSuggestedOutputName(suggestedSource));
      const permitted = await ensureOutputHandlePermission(handle);
      if (!permitted) {
        throw new Error('Permission to write to the selected output file was denied.');
      }
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
      files: pickedFiles.map((file) => `[upload] ${file.name}`),
      aspectRatio,
      targetDuration,
      durationStep: fineDurationSteps ? 1 : 5,
      mode,
      style,
      fps,
      outputPath: outputPath.trim() || (outputHandleName ? `[save picker] ${outputHandleName}` : ''),
      enableOverlays,
      uploadCount: pickedFiles.length,
      captions: enableCaptions
        ? captions.map(({ text, start, end }) => ({ text, start, end }))
        : [],
    }),
    [
      pickedFiles,
      aspectRatio,
      targetDuration,
      fineDurationSteps,
      mode,
      style,
      fps,
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

      formData.append('targetDuration', String(targetDuration));
      formData.append('aspectRatio', aspectRatio);
      formData.append('mode', mode);
      formData.append('style', style);
      formData.append('fps', String(fps));
      formData.append('enableOverlays', String(enableOverlays));
      formData.append('captions', JSON.stringify(normalizedCaptions));

      if (outputPath.trim()) {
        formData.append('outputPath', outputPath.trim());
      }

      return formData;
    }

    return {
      files: [],
      aspectRatio,
      targetDuration,
      mode,
      style,
      fps,
      outputPath: outputPath.trim() || DEFAULT_OUTPUT,
      enableOverlays,
      captions: normalizedCaptions,
    };
  };

  const persistRenderedOutput = async (resultOutputPath) => {
    if (!outputHandle) return;

    const permitted = await hasOutputHandlePermission(outputHandle);
    if (!permitted) {
      throw new Error(
        'Saved output permission expired. Choose the output file again, then rerun the render.',
      );
    }

    const renderedBlob = await downloadRenderedVideo(resultOutputPath);
    await writeBlobToHandle(outputHandle, renderedBlob);
    log(`Saved render to ${outputHandle.name}`, 'ok');
  };

  // ----- Render lifecycle -----
  const startRender = async () => {
    if (!pickedFiles.length) {
      log('No input files', 'err');
      setStatus('error', 'ERROR', 'Add at least one input file.');
      return;
    }

    if (outputHandle && !outputPath.trim()) {
      const permitted = await ensureOutputHandlePermission(outputHandle);
      if (!permitted) {
        const message =
          'Choose the output file again before rendering so the browser can save the finished video there.';
        setStatus('error', 'OUTPUT PERMISSION', message);
        log(message, 'err');
        return;
      }
    }

    setProgressVisible(true);
    setProgress(10);
    setResult(null);
    setRenderElapsedMs(null);
    renderStartedAtRef.current = Date.now();
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
      const elapsedMs = Date.now() - renderStartedAtRef.current;
      setRenderElapsedMs(elapsedMs);

      if (data && data.success) {
        if (data.result?.outputPath && outputHandle && !outputPath.trim()) {
          await persistRenderedOutput(data.result.outputPath);
        }
        setStatus(
          'success',
          'COMPLETE',
          `Render finished in ${formatElapsed(elapsedMs)}.`,
        );
        log('Done -> ' + (data.result?.outputPath || ''), 'ok');
        log(`Render completed in ${formatElapsed(elapsedMs)}`, 'ok');
        setResult(data);
      } else {
        const e = getRenderGuidance(data);
        setStatus('error', 'FAILED', e);
        log('Failed: ' + e, 'err');
      }
    } catch (e) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      const message =
        e?.message === 'Failed to fetch'
          ? 'Cannot reach localhost:3001 - is the backend running?'
          : e?.message || 'Render failed unexpectedly.';
      setStatus('error', 'FAILED', message);
      log('Error: ' + message, 'err');
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

    const storedHelpMode = window.localStorage.getItem(HELP_MODE_STORAGE_KEY);
    if (storedHelpMode !== null) {
      setHelpEnabled(storedHelpMode === 'true');
    }

    const storedFineSteps = window.localStorage.getItem(DURATION_STEP_STORAGE_KEY);
    if (storedFineSteps !== null) {
      setFineDurationSteps(storedFineSteps === 'true');
    }

    const storedPreviewExpanded = window.localStorage.getItem(PREVIEW_SIZE_STORAGE_KEY);
    if (storedPreviewExpanded !== null) {
      setPreviewExpanded(storedPreviewExpanded === 'true');
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

  useEffect(() => {
    window.localStorage.setItem(HELP_MODE_STORAGE_KEY, String(helpEnabled));
  }, [helpEnabled]);

  useEffect(() => {
    window.localStorage.setItem(
      DURATION_STEP_STORAGE_KEY,
      String(fineDurationSteps),
    );

    if (!fineDurationSteps) {
      setTargetDuration((prev) => roundToNearestFive(prev));
    }
  }, [fineDurationSteps]);

  useEffect(() => {
    window.localStorage.setItem(
      PREVIEW_SIZE_STORAGE_KEY,
      String(previewExpanded),
    );
  }, [previewExpanded]);

  return (
    <div className="shell">
      <Header
        apiOnline={apiOnline}
        helpEnabled={helpEnabled}
        onToggleHelp={() => setHelpEnabled((prev) => !prev)}
      />
      <div className="body">
        <SourcesPanel
          pickedFiles={pickedFiles}
          outputPath={outputPath}
          outputHandleName={outputHandleName}
          canPickOutput={supportsFileSystemAccess()}
          helpEnabled={helpEnabled}
          captions={captions}
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
          aspectRatio={aspectRatio}
          style={style}
          mode={mode}
          fps={fps}
          targetDuration={targetDuration}
          fineDurationSteps={fineDurationSteps}
          enableOverlays={enableOverlays}
          enableCaptions={enableCaptions}
          previewExpanded={previewExpanded}
          previewAspectRatio={getPreviewAspectRatio(aspectRatio)}
          helpEnabled={helpEnabled}
          renderState={renderState}
          result={result}
          onSetAspectRatio={setAspectRatio}
          onSetStyle={setStyle}
          onSetMode={setMode}
          onSetFps={setFps}
          onSetTargetDuration={setTargetDuration}
          onSetFineDurationSteps={setFineDurationSteps}
          onSetEnableOverlays={setEnableOverlays}
          onSetEnableCaptions={setEnableCaptions}
          onTogglePreviewSize={() =>
            setPreviewExpanded((prev) => !prev)
          }
          onRender={startRender}
        />
        <StatusPanel
          helpEnabled={helpEnabled}
          renderState={renderState}
          statusLabel={statusLabel}
          statusMsg={statusMsg}
          progress={progress}
          progressVisible={progressVisible}
          renderElapsedMs={renderElapsedMs}
          result={result}
          payload={payload}
          logs={logs}
        />
      </div>
    </div>
  );
}
