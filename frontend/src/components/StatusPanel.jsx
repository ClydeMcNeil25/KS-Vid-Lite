import { useEffect, useRef } from 'react';
import HelpTooltip from './HelpTooltip.jsx';
import styles from '../styles/StatusPanel.module.css';

const SBAR_VARIANT = {
  idle: '',
  success: styles.sbarSuccess,
  error: styles.sbarError,
  loading: styles.sbarLoading,
};
const SLABEL_VARIANT = {
  idle: styles.slabelIdle,
  success: styles.slabelSuccess,
  error: styles.slabelError,
  loading: styles.slabelLoading,
};
const LT_VARIANT = {
  ok: styles.ltOk,
  err: styles.ltErr,
  info: styles.ltInfo,
  '': '',
};

function ResultMeta({ data, renderElapsedMs }) {
  const r = data?.result;
  if (!r) return null;
  const items = [
    { l: 'Output', v: r.outputPathDisplay || r.outputPath || '-' },
    { l: 'Stage', v: data.stage || '-' },
    { l: 'Clips', v: r.media ? r.media.length : '-' },
    { l: 'Valid', v: r.validation ? 'pass' : '-' },
    { l: 'Render time', v: renderElapsedMs ? `${(renderElapsedMs / 1000).toFixed(1)}s` : '-' },
  ];
  return (
    <div className={styles.rmeta}>
      {items.map((i) => (
        <div key={i.l} className={styles.rchip}>
          <div className={styles.rchipL}>{i.l}</div>
          <div className={styles.rchipV}>{String(i.v)}</div>
        </div>
      ))}
    </div>
  );
}

export default function StatusPanel({
  helpEnabled,
  renderState,
  statusLabel,
  statusMsg,
  progress,
  progressVisible,
  renderElapsedMs,
  result,
  payload,
  logs,
}) {
  const logRef = useRef(null);

  // Auto-scroll log to bottom on new entries.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  const showResult = renderState === 'success' && result?.result;

  return (
    <div className="panel right">
      <div className="ph">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text2)"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="ph-title">Render Status</span>
      </div>

      <div className="pb">
        {/* Status bar */}
        <HelpTooltip
          enabled={helpEnabled}
          content="This is the live render state. Watch here for success, failure, and backend status messages during each run."
          block
        >
          <div className={`${styles.sbar} ${SBAR_VARIANT[renderState] || ''}`}>
            <div
              className={`${styles.slabel} ${
                SLABEL_VARIANT[renderState] || styles.slabelIdle
              }`}
            >
              {statusLabel}
            </div>
            <div className={styles.smsg}>{statusMsg}</div>
          </div>
        </HelpTooltip>

        {/* Progress */}
        {progressVisible && (
          <div className={styles.progressWrap}>
            <div className={styles.progressLabel}>{Math.round(progress)}%</div>
            <div className={styles.progTrack}>
              <div
                className={`${styles.progFill} ${
                  renderState === 'loading' ? styles.progFillActive : ''
                }`}
                style={{ width: `${Math.round(progress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Result meta */}
        {showResult && (
          <div className={styles.resPanel}>
            <HelpTooltip
              enabled={helpEnabled}
              content="This summarizes the last successful render, including where the output went and whether validation passed."
              block
            >
              <div className="fl">Result</div>
            </HelpTooltip>
            <ResultMeta data={result} renderElapsedMs={renderElapsedMs} />
          </div>
        )}

        <div className="divider" />

        {/* Request JSON preview */}
        <div className="field">
          <HelpTooltip
            enabled={helpEnabled}
            content="This shows the exact request payload the frontend is preparing to send to the backend."
            block
          >
            <div className="fl">Request JSON</div>
          </HelpTooltip>
          <div className={styles.reqPre}>
            {JSON.stringify(payload, null, 2)}
          </div>
        </div>

        {/* Log */}
        <div className="field">
          <HelpTooltip
            enabled={helpEnabled}
            content="The log records recent events like file picks, backend reachability, render starts, errors, and successful saves."
            block
          >
            <div className="fl">Log</div>
          </HelpTooltip>
          <div className={styles.log} ref={logRef}>
            {logs.map((l, i) => (
              <div key={i} className={styles.ll}>
                <span className={styles.lts}>{l.ts}</span>
                <span
                  className={`${styles.lt} ${LT_VARIANT[l.type] || ''}`}
                >
                  {l.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
