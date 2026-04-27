import styles from '../styles/Header.module.css';

export default function Header({ apiOnline }) {
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
      <div className={styles.hstatus}>
        <div
          className={`${styles.dot} ${offline ? styles.dotOffline : ''}`}
        />
        <span>{apiText}</span>
      </div>
    </header>
  );
}
