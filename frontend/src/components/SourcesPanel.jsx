import { useRef, useState } from 'react';
import styles from '../styles/SourcesPanel.module.css';

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

export default function SourcesPanel({
  files,
  pickedFiles,
  outputPath,
  captions,
  onAddFile,
  onRemoveFile,
  onAddPickedFiles,
  onRemovePickedFile,
  onSetOutputPath,
  onAddCaption,
  onUpdateCaption,
  onRemoveCaption,
}) {
  const [draftPath, setDraftPath] = useState('');
  const fileInputRef = useRef(null);

  const submitDraft = () => {
    if (!draftPath.trim()) return;
    onAddFile(draftPath);
    setDraftPath('');
  };

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
          <label className="fl">Source videos</label>
          <div className={styles.buttonRow}>
            <button
              className={`btn-add ${styles.primaryBrowseBtn}`}
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              + Browse video files
            </button>
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
            Pick local video files directly, or paste a full file path as a
            fallback.
          </p>
        </div>

        <div className={styles.fileList}>
          {pickedFiles.map((file, i) => (
            <div key={`${file.name}-${file.lastModified}-${i}`} className={styles.fpill}>
              <div className={styles.fpillIco}>
                <FileIcon />
              </div>
              <span className={styles.fpillPath} title={file.name}>
                {file.name}
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
          ))}
        </div>

        <div className="field">
          <label className="fl">Manual file path</label>
          <input
            className="fi"
            placeholder="D:/path/to/video.mp4"
            value={draftPath}
            onChange={(e) => setDraftPath(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitDraft();
            }}
          />
        </div>

        <button className="btn-add" onClick={submitDraft}>
          + Add file path
        </button>

        <div className={styles.fileList}>
          {files.map((f, i) => (
            <div key={`${f}-${i}`} className={styles.fpill}>
              <div className={styles.fpillIco}>
                <FileIcon />
              </div>
              <span className={styles.fpillPath} title={f}>
                {f}
              </span>
              <button
                className={styles.fpillRm}
                onClick={() => onRemoveFile(i)}
                aria-label="Remove file"
              >
                &#10005;
              </button>
            </div>
          ))}
        </div>

        <div className="divider" />

        {/* Output path */}
        <div className="field">
          <label className="fl">Output path (optional)</label>
          <input
            className="fi"
            placeholder="Leave blank to auto-save into backend/test-assets"
            value={outputPath}
            onChange={(e) => onSetOutputPath(e.target.value)}
          />
          <p className={styles.helperText}>
            If blank, the backend will auto-generate a render path for you.
          </p>
        </div>

        <div className="divider" />

        {/* Captions */}
        <div className="field">
          <label className="fl">Captions</label>
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
          <button
            className={`btn-add ${styles.addCapBtn}`}
            onClick={onAddCaption}
          >
            + Add caption
          </button>
        </div>
      </div>
    </div>
  );
}
