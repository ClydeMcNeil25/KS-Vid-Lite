import styles from '../styles/CenterPanel.module.css';

const STYLES = ['viral', 'cinematic', 'podcast', 'clean'];
const MODES = ['strict', 'smart', 'free'];

function Chip({ value, current, onSelect }) {
  return (
    <div
      className={`chip ${current === value ? 'on' : ''}`}
      onClick={() => onSelect(value)}
    >
      {value}
    </div>
  );
}

function PreviewIdle() {
  return (
    <>
      <div className={styles.pvIcon}>
        <svg viewBox="0 0 24 24">
          <path d="M5 3l14 9-14 9V3z" />
        </svg>
      </div>
      <span className={styles.previewLabel}>No output yet</span>
      <span className={styles.previewHint}>configure -&gt; render</span>
    </>
  );
}

function PreviewSuccess({ outputPath }) {
  return (
    <div className={styles.successWrap}>
      <div className={styles.successCheck}>&#10003;</div>
      <div className={styles.successText}>Render complete</div>
      <div className={styles.successPath}>{outputPath || ''}</div>
    </div>
  );
}

export default function CenterPanel({
  style,
  mode,
  targetDuration,
  enableOverlays,
  enableCaptions,
  renderState,
  result,
  onSetStyle,
  onSetMode,
  onSetTargetDuration,
  onSetEnableOverlays,
  onSetEnableCaptions,
  onRender,
}) {
  const success = renderState === 'success' && result?.result;
  const rendering = renderState === 'loading';

  return (
    <div className={styles.center}>
      {/* Preview */}
      <div className={styles.previewZone}>
        <div
          className={`${styles.previewBox} ${
            success ? styles.previewBoxSuccess : ''
          }`}
        >
          {success ? (
            <PreviewSuccess outputPath={result.result.outputPath} />
          ) : (
            <PreviewIdle />
          )}
        </div>
      </div>

      {/* Config */}
      <div className={styles.centerConfig}>
        <div className={styles.cfgGrid}>
          <div className={`${styles.cfgRow} ${styles.cfgRowFirst}`}>
            <div className="fl">Style</div>
            <div className="chips">
              {STYLES.map((v) => (
                <Chip
                  key={v}
                  value={v}
                  current={style}
                  onSelect={onSetStyle}
                />
              ))}
            </div>
          </div>
          <div className={`${styles.cfgRow} ${styles.cfgRowSecond}`}>
            <div className="fl">Duration mode</div>
            <div className="chips">
              {MODES.map((v) => (
                <Chip
                  key={v}
                  value={v}
                  current={mode}
                  onSelect={onSetMode}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.cfgRow}>
          <div className={styles.durHeader}>
            <div className="fl">Target duration</div>
            <span className={styles.durVal}>{targetDuration}s</span>
          </div>
          <input
            type="range"
            min="5"
            max="120"
            step="1"
            value={targetDuration}
            onChange={(e) => onSetTargetDuration(parseInt(e.target.value, 10))}
            className={styles.durRange}
          />
        </div>

        <div className={`${styles.cfgRow} ${styles.cfgRowToggles}`}>
          <div className={`trow ${styles.toggleBox}`}>
            <span className="tlabel">Enable overlays</span>
            <label className="tog">
              <input
                type="checkbox"
                checked={enableOverlays}
                onChange={(e) => onSetEnableOverlays(e.target.checked)}
              />
              <div className="tog-track" />
              <div className="tog-thumb" />
            </label>
          </div>
          <div className={styles.toggleDivider} />
          <div className={`trow ${styles.toggleBox}`}>
            <span className="tlabel">Enable captions</span>
            <label className="tog">
              <input
                type="checkbox"
                checked={enableCaptions}
                onChange={(e) => onSetEnableCaptions(e.target.checked)}
              />
              <div className="tog-track" />
              <div className="tog-thumb" />
            </label>
          </div>
        </div>
      </div>

      {/* Render button footer */}
      <div className={styles.renderFooter}>
        <button
          className={styles.btnRender}
          disabled={rendering}
          onClick={onRender}
        >
          {rendering ? 'Rendering...' : '▶  Render'}
        </button>
      </div>
    </div>
  );
}
