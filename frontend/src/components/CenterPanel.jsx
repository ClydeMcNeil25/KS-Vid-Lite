import HelpTooltip from './HelpTooltip.jsx';
import { getPreviewVideoUrl } from '../api/render.js';
import styles from '../styles/CenterPanel.module.css';

const ASPECT_RATIOS = ['9:16', '1:1', '16:9'];
const STYLES = ['viral', 'cinematic', 'podcast', 'clean'];
const MODES = ['strict', 'smart', 'free'];
const FPS_OPTIONS = [
  { value: 29.97, label: '29.97 fps' },
  { value: 30, label: '30 fps' },
  { value: 60, label: '60 fps' },
];

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

function PreviewSuccess({ outputPath, previewUrl }) {
  const resolvedPreviewUrl = previewUrl || getPreviewVideoUrl(outputPath);

  return (
    <div className={styles.previewPlayerWrap}>
      <video
        key={resolvedPreviewUrl}
        className={styles.previewVideo}
        src={resolvedPreviewUrl}
        controls
        preload="metadata"
      />
      <div className={styles.previewMeta}>
        <div className={styles.successText}>Preview ready</div>
        <div className={styles.successPath}>{outputPath || ''}</div>
      </div>
    </div>
  );
}

export default function CenterPanel({
  aspectRatio,
  style,
  mode,
  fps,
  targetDuration,
  fineDurationSteps,
  enableOverlays,
  enableCaptions,
  previewExpanded,
  previewAspectRatio,
  helpEnabled,
  renderState,
  result,
  previewUrl,
  onSetAspectRatio,
  onSetStyle,
  onSetMode,
  onSetFps,
  onSetTargetDuration,
  onSetFineDurationSteps,
  onSetEnableOverlays,
  onSetEnableCaptions,
  onTogglePreviewSize,
  onRender,
}) {
  const success = renderState === 'success' && result?.result;
  const rendering = renderState === 'loading';

  return (
    <div className={styles.center}>
      <div className={styles.previewZone}>
        <div className={styles.previewToolbar}>
          <HelpTooltip
            enabled={helpEnabled}
            content="Make the preview window larger when you want a closer look at the finished video."
          >
            <button
              type="button"
              className={styles.previewToggle}
              onClick={onTogglePreviewSize}
            >
              {previewExpanded ? 'Standard Preview' : 'Larger Preview'}
            </button>
          </HelpTooltip>
        </div>
        <div
          className={`${styles.previewBox} ${
            success ? styles.previewBoxSuccess : ''
          } ${previewExpanded ? styles.previewBoxExpanded : ''}`}
          style={{ aspectRatio: previewAspectRatio }}
        >
          {success ? (
            <PreviewSuccess
              outputPath={result.result.outputPathDisplay || result.result.outputPath}
              previewUrl={previewUrl}
            />
          ) : (
            <PreviewIdle />
          )}
        </div>
      </div>

      <div className={styles.centerConfig}>
        <div className={styles.cfgGrid}>
          <div className={`${styles.cfgRow} ${styles.cfgGridCell}`}>
            <HelpTooltip
              enabled={helpEnabled}
              content="Aspect ratio sets the shape of the final video frame for portrait, square, or widescreen output."
              block
            >
              <div className="fl">Aspect ratio</div>
            </HelpTooltip>
            <div className="chips">
              {ASPECT_RATIOS.map((value) => (
                <HelpTooltip
                  key={value}
                  enabled={helpEnabled}
                  content={
                    value === '9:16'
                      ? 'Portrait format for Shorts, Reels, and TikTok-style output.'
                      : value === '1:1'
                        ? 'Square format for balanced social posts and compact previews.'
                        : 'Widescreen format for landscape video and traditional playback.'
                  }
                >
                  <Chip
                    value={value}
                    current={aspectRatio}
                    onSelect={onSetAspectRatio}
                  />
                </HelpTooltip>
              ))}
            </div>
          </div>

          <div className={`${styles.cfgRow} ${styles.cfgGridCell}`}>
            <HelpTooltip
              enabled={helpEnabled}
              content="FPS controls how many frames per second the final render uses. Higher values feel smoother but can increase processing time."
              block
            >
              <div className="fl">Output FPS</div>
            </HelpTooltip>
            <div className="chips">
              {FPS_OPTIONS.map((option) => (
                <HelpTooltip
                  key={option.label}
                  enabled={helpEnabled}
                  content={
                    option.value === 29.97
                      ? 'A standard broadcast-friendly frame rate that works well for most web video.'
                      : option.value === 30
                        ? 'A simple default that balances smooth motion and quick renders.'
                        : 'A smoother high-frame-rate option that works best when your source footage supports it.'
                  }
                >
                  <button
                    type="button"
                    className={`chip ${fps === option.value ? 'on' : ''}`}
                    onClick={() => onSetFps(option.value)}
                  >
                    {option.label}
                  </button>
                </HelpTooltip>
              ))}
            </div>
          </div>

          <div className={`${styles.cfgRow} ${styles.cfgGridCell}`}>
            <HelpTooltip
              enabled={helpEnabled}
              content="Style chooses the overall editing vibe and pacing for the final video."
              block
            >
              <div className="fl">Style</div>
            </HelpTooltip>
            <div className="chips">
              {STYLES.map((value) => (
                <HelpTooltip
                  key={value}
                  enabled={helpEnabled}
                  content={`Use the ${value} preset to change how the edit is assembled and paced.`}
                >
                  <Chip value={value} current={style} onSelect={onSetStyle} />
                </HelpTooltip>
              ))}
            </div>
          </div>

          <div className={styles.cfgRow}>
            <HelpTooltip
              enabled={helpEnabled}
              content="Duration mode controls how strict the editor is about matching your target runtime."
              block
            >
              <div className="fl">Duration mode</div>
            </HelpTooltip>
            <div className="chips">
              {MODES.map((value) => (
                <HelpTooltip
                  key={value}
                  enabled={helpEnabled}
                  content={
                    value === 'strict'
                      ? 'Strict blocks renders when the footage does not match the target closely enough.'
                      : value === 'smart'
                        ? 'Smart is the default. It tries to fit the footage while still preventing unrealistic renders.'
                        : 'Free removes duration blocking and lets the render continue.'
                  }
                >
                  <Chip value={value} current={mode} onSelect={onSetMode} />
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
              step={fineDurationSteps ? '1' : '5'}
              value={targetDuration}
              onChange={(e) => onSetTargetDuration(parseInt(e.target.value, 10))}
              className={styles.durRange}
            />
          </HelpTooltip>
          <HelpTooltip
            enabled={helpEnabled}
            content="Turn this on when you need one-second duration adjustments instead of the simpler five-second steps."
            block
          >
            <div className={`trow ${styles.stepToggleRow}`}>
              <span className="tlabel">Fine duration steps (1s)</span>
              <label className="tog">
                <input
                  type="checkbox"
                  checked={fineDurationSteps}
                  onChange={(e) => onSetFineDurationSteps(e.target.checked)}
                />
                <div className="tog-track" />
                <div className="tog-thumb" />
              </label>
            </div>
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
            {rendering ? 'Rendering...' : '> Render'}
          </button>
        </HelpTooltip>
      </div>
    </div>
  );
}
