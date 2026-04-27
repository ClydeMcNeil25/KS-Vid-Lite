import styles from '../styles/HelpTooltip.module.css';

export default function HelpTooltip({
  enabled,
  content,
  children,
  block = false,
}) {
  if (!enabled || !content) {
    return children;
  }

  return (
    <span className={`${styles.wrapper} ${block ? styles.block : ''}`}>
      {children}
      <span className={styles.tooltip} role="note">
        {content}
      </span>
    </span>
  );
}
