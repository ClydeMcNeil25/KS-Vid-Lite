import { useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import SourcesPanel from './components/SourcesPanel.jsx';
import CenterPanel from './components/CenterPanel.jsx';
import StatusPanel from './components/StatusPanel.jsx';
import { renderVideo, pingBackend } from './api/render.js';

const DEFAULT_OUTPUT =
  'D:/Dropbox/05 Development/KS-Vid-Lite/backend/test-assets/api-test-output.mp4';

function nowStamp() {
  const n = new Date();
  return [n.getHours(), n.getMinutes(), n.getSeconds()]
    .map((x) => x.toString().padStart(2, '0'))
    .join(':');
}

export default function App() {
  // ----- Sources -----
  const [files, setFiles] = useState([]);
  const [outputPath, setOutputPath] = useState(DEFAULT_OUTPUT);
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
      files: [...files],
      targetDuration,
      mode,
      style,
      outputPath: outputPath.trim(),
      enableOverlays,
      captions: enableCaptions
        ? captions.map(({ text, start, end }) => ({ text, start, end }))
        : [],
    }),
    [
      files,
      targetDuration,
      mode,
      style,
      outputPath,
      enableOverlays,
      enableCaptions,
      captions,
    ],
  );

  // ----- Render lifecycle -----
  const startRender = async () => {
    if (!payload.files.length) {
      log('No input files', 'err');
      setStatus('error', 'ERROR', 'Add at least one input file.');
      return;
    }
    if (!payload.outputPath) {
      log('No output path', 'err');
      setStatus('error', 'ERROR', 'Set an output path.');
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
      const data = await renderVideo(payload);
      clearInterval(tickRef.current);
      tickRef.current = null;
      setProgress(100);

      if (data && data.success) {
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
    let cancelled = false;
    (async () => {
      const ok = await pingBackend(2000);
      if (cancelled) return;
      setApiOnline(ok);
      if (ok) log('API reachable', 'ok');
      else log('Backend offline - start server first', 'err');
    })();
    return () => {
      cancelled = true;
      if (tickRef.current) clearInterval(tickRef.current);
      if (hideProgressTimerRef.current)
        clearTimeout(hideProgressTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="shell">
      <Header apiOnline={apiOnline} />
      <div className="body">
        <SourcesPanel
          files={files}
          outputPath={outputPath}
          captions={captions}
          onAddFile={addFile}
          onRemoveFile={removeFile}
          onSetOutputPath={setOutputPath}
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
