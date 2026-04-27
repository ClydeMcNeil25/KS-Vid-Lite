import { useRef } from 'react';
import HelpTooltip from './HelpTooltip.jsx';
import styles from '../styles/SourcesPanel.module.css';

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function shortenFileName(name, maxLength = 26) {
  if (name.length <= maxLength) return name;
  const extIndex = name.lastIndexOf('.');
  const ext = extIndex > 0 ? name.slice(extIndex) : '';
  const base = extIndex > 0 ? name.slice(0, extIndex) : name;
  const available = Math.max(8, maxLength - ext.length - 3);
  return `${base.slice(0, available)}...${ext}`;
}

export default function SourcesPanel({
  pickedFiles,
  outputPath,
  outputHandleName,
  canPickOutput,
  helpEnabled,
  captions,
  onAddPickedFiles,
  onRemovePickedFile,
  onSetOutputPath,
  onChooseOutputFile,
  onClearOutputTarget,
  onAddCaption,
  onUpdateCaption,
  onRemoveCaption,
}) {
  const fileInputRef = useRef(null);

  const handleFileSelection = (event) => {
    const selected = Array.from(event.target.files ?? []);
    if (!selected.length) return;
    onAddPickedFiles(selected);
    event.target.value = '';
  };

  return (
    <div className="panel left">
      <div className="ph">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text2)"
          strokeWidth="2"
        >
          <path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span className="ph-title">Sources</span>
      </div>

      <div className="pb">
        {/* Input files */}
        <div className="field">
          <HelpTooltip
            enabled={helpEnabled}
            content="Choose the video clips you want the editor to cut together. You can pick one clip or several clips for the render."
            block
          >
            <label className="fl">Source videos</label>
          </HelpTooltip>
          <div className={styles.buttonRow}>
            <HelpTooltip
              enabled={helpEnabled}
              content="Open your computer's file picker and add the source videos for this render."
            >
              <button
                className={`btn-add ${styles.primaryBrowseBtn}`}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                + Browse video files
              </button>
            </HelpTooltip>
            <input
              ref={fileInputRef}
              className={styles.hiddenInput}
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileSelection}
            />
          </div>
          <p className={styles.helperText}>
            Pick one or more local video files directly from your computer.
          </p>
        </div>

        <div className={styles.fileList}>
          {pickedFiles.map((file, i) => (
            <HelpTooltip
              key={`${file.name}-${file.lastModified}-${i}`}
              enabled={helpEnabled}
              content="This clip is queued for the next render. Use the X button to remove it."
              block
            >
              <div className={styles.fpill}>
                <div className={styles.fpillIco}>
                  <FileIcon />
                </div>
                <span className={styles.fpillPath} title={file.name}>
                  {shortenFileName(file.name)}
                </span>
                <span className={styles.fileTag}>upload</span>
                <button
                  className={styles.fpillRm}
                  onClick={() => onRemovePickedFile(i)}
                  aria-label="Remove file"
                >
                  &#10005;
                </button>
              </div>
            </HelpTooltip>
          ))}
        </div>

        <div className="divider" />

        {/* Output path */}
        <div className="field">
          <HelpTooltip
            enabled={helpEnabled}
            content="Pick where the final rendered video should go. You can remember a browser-selected destination or type a one-time backend output path override."
            block
          >
            <label className="fl">Output destination</label>
          </HelpTooltip>
          {canPickOutput && (
            <div className={styles.buttonRow}>
              <HelpTooltip
                enabled={helpEnabled}
                content="Choose the final MP4 file destination. The app can remember this destination for future renders."
              >
                <button
                  className={`btn-add ${styles.primaryBrowseBtn}`}
                  onClick={onChooseOutputFile}
                  type="button"
                >
                  + Choose output file
                </button>
              </HelpTooltip>
              {outputHandleName && (
                <HelpTooltip
                  enabled={helpEnabled}
                  content="Forget the remembered output destination so future renders use a new chosen file or stay temporary until you save them."
                >
                  <button
                    className={`btn-add ${styles.secondaryActionBtn}`}
                    onClick={onClearOutputTarget}
                    type="button"
                  >
                    Clear saved target
                  </button>
                </HelpTooltip>
              )}
            </div>
          )}
          {outputHandleName && (
            <HelpTooltip
              enabled={helpEnabled}
              content="This is the remembered output file that new renders will save into when the manual override field stays blank."
              block
            >
              <div className={styles.outputTargetCard}>
                <span className={styles.outputTargetLabel}>Saved output target</span>
                <span className={styles.outputTargetName} title={outputHandleName}>
                  {shortenFileName(outputHandleName, 32)}
                </span>
              </div>
            </HelpTooltip>
          )}
          <HelpTooltip
            enabled={helpEnabled}
            content="Advanced override: type a specific backend output path for this render only. Leave this blank to use the remembered output file or keep the backend render temporary."
            block
          >
            <input
              className="fi"
              placeholder="Optional manual backend path override"
              value={outputPath}
              onChange={(e) => onSetOutputPath(e.target.value)}
            />
          </HelpTooltip>
          <p className={styles.helperText}>
            If you choose an output file above, the app will remember it and
            save future renders there. If this field is blank and no output
            file is selected, the backend render stays temporary and is cleaned
            up once it is no longer needed.
          </p>
        </div>

        <div className="divider" />

        {/* Captions */}
        <div className="field">
          <HelpTooltip
            enabled={helpEnabled}
            content="Add timed captions manually. Each caption entry controls the text plus the start and end time where it should appear."
            block
          >
            <label className="fl">Captions</label>
          </HelpTooltip>
          <div className={styles.capList}>
            {captions.map((c) => (
              <div key={c.id} className={styles.cc}>
                <div className={styles.ccHd}>
                  <span className={styles.ccTs}>CAPTION #{c.id}</span>
                  <button
                    className={styles.ccRm}
                    onClick={() => onRemoveCaption(c.id)}
                    aria-label="Remove caption"
                  >
                    &#10005;
                  </button>
                </div>
                <input
                  className={`fi ${styles.ccText}`}
                  placeholder="Caption text..."
                  value={c.text}
                  onChange={(e) =>
                    onUpdateCaption(c.id, 'text', e.target.value)
                  }
                />
                <div className={styles.cc2}>
                  <div className="field">
                    <label className="fl">Start (s)</label>
                    <input
                      className="fi"
                      type="number"
                      min="0"
                      value={c.start}
                      onChange={(e) =>
                        onUpdateCaption(c.id, 'start', e.target.value)
                      }
                    />
                  </div>
                  <div className="field">
                    <label className="fl">End (s)</label>
                    <input
                      className="fi"
                      type="number"
                      min="0"
                      value={c.end}
                      onChange={(e) =>
                        onUpdateCaption(c.id, 'end', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <HelpTooltip
            enabled={helpEnabled}
            content="Create a new caption row so you can type the caption text and timing."
          >
            <button
              className={`btn-add ${styles.addCapBtn}`}
              onClick={onAddCaption}
            >
              + Add caption
            </button>
          </HelpTooltip>
        </div>
      </div>
    </div>
  );
}
