import styles from '../styles/Header.module.css';
import HelpTooltip from './HelpTooltip.jsx';

export default function Header({ apiOnline, helpEnabled, onToggleHelp }) {
  // apiOnline: null = unknown (still probing), true = reachable, false = offline.
  const offline = apiOnline === false;
  const apiText = offline ? 'API: offline' : 'API: localhost:3001';

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 24 24">
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
        </div>
        <span className={styles.logoText}>KS-VID-LITE</span>
        <span className={styles.logoBadge}>ALPHA</span>
      </div>
      <div className={styles.rightTools}>
        <HelpTooltip
          enabled={helpEnabled}
          content="Turn guided hover tips on while you learn the app, then switch them off once the workflow feels natural."
        >
          <button
            type="button"
            className={`${styles.helpToggle} ${
              helpEnabled ? styles.helpToggleOn : ''
            }`}
            onClick={onToggleHelp}
          >
            Help: {helpEnabled ? 'On' : 'Off'}
          </button>
        </HelpTooltip>
        <HelpTooltip
          enabled={helpEnabled}
          content="This shows whether the frontend can currently reach the local KS-Vid-Lite backend API."
        >
          <div className={styles.hstatus}>
            <div
              className={`${styles.dot} ${offline ? styles.dotOffline : ''}`}
            />
            <span>{apiText}</span>
          </div>
        </HelpTooltip>
      </div>
    </header>
  );
}
