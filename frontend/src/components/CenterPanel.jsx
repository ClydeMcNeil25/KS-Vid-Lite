import HelpTooltip from './HelpTooltip.jsx';
import styles from '../styles/CenterPanel.module.css';

const STYLES = ['viral', 'cinematic', 'podcast', 'clean'];
const MODES = ['strict', 'smart', 'free'];

function Chip({ value, current, onSelect }) {
  return (
    <button
      type="button"
      className={`chip ${current === value ? 'on' : ''}`}
      onClick={() => onSelect(value)}
    >
      {value}
    </button>
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
  helpEnabled,
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

      <div className={styles.centerConfig}>
        <div className={styles.cfgGrid}>
          <div className={`${styles.cfgRow} ${styles.cfgRowFirst}`}>
            <HelpTooltip
              enabled={helpEnabled}
              content="Style presets shape the pacing and feel of the auto-edit. Viral is the safest fast-moving default."
              block
            >
              <div className="fl">Style</div>
            </HelpTooltip>
            <div className="chips">
              {STYLES.map((v) => (
                <HelpTooltip
                  key={v}
                  enabled={helpEnabled}
                  content={`Use the ${v} preset to change how the edit is assembled and paced.`}
                >
                  <Chip value={v} current={style} onSelect={onSetStyle} />
                </HelpTooltip>
              ))}
            </div>
          </div>
          <div className={`${styles.cfgRow} ${styles.cfgRowSecond}`}>
            <HelpTooltip
              enabled={helpEnabled}
              content="Duration mode controls how strict the editor is about matching your target runtime."
              block
            >
              <div className="fl">Duration mode</div>
            </HelpTooltip>
            <div className="chips">
              {MODES.map((v) => (
                <HelpTooltip
                  key={v}
                  enabled={helpEnabled}
                  content={
                    v === 'strict'
                      ? 'Strict blocks renders when the footage does not match the target closely enough.'
                      : v === 'smart'
                        ? 'Smart is the default. It tries to fit the footage while still preventing unrealistic renders.'
                        : 'Free removes duration blocking and lets the render continue.'
                  }
                >
                  <Chip value={v} current={mode} onSelect={onSetMode} />
                </HelpTooltip>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.cfgRow}>
          <div className={styles.durHeader}>
            <HelpTooltip
              enabled={helpEnabled}
              content="Choose the intended final video length. For the easiest first run, keep it close to your source footage length."
              block
            >
              <div className="fl">Target duration</div>
            </HelpTooltip>
            <span className={styles.durVal}>{targetDuration}s</span>
          </div>
          <HelpTooltip
            enabled={helpEnabled}
            content="Drag this slider to shorten or extend the final target runtime."
            block
          >
            <input
              type="range"
              min="5"
              max="120"
              step="1"
              value={targetDuration}
              onChange={(e) => onSetTargetDuration(parseInt(e.target.value, 10))}
              className={styles.durRange}
            />
          </HelpTooltip>
        </div>

        <div className={`${styles.cfgRow} ${styles.cfgRowToggles}`}>
          <HelpTooltip
            enabled={helpEnabled}
            content="Overlays add built-in text elements like labels and styled on-screen text during the render."
            block
          >
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
          </HelpTooltip>
          <div className={styles.toggleDivider} />
          <HelpTooltip
            enabled={helpEnabled}
            content="Captions include the manual caption entries from the Sources panel in the final video."
            block
          >
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
          </HelpTooltip>
        </div>
      </div>

      <div className={styles.renderFooter}>
        <HelpTooltip
          enabled={helpEnabled}
          content="Start the full auto-edit pipeline using the current clips, style, duration, overlays, and caption settings."
          block
        >
          <button
            className={styles.btnRender}
            disabled={rendering}
            onClick={onRender}
          >
            {rendering ? 'Rendering...' : '▶  Render'}
          </button>
        </HelpTooltip>
      </div>
    </div>
  );
}
