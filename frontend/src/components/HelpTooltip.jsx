import { cloneElement, isValidElement, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '../styles/HelpTooltip.module.css';

function TooltipLayer({ anchorRect, content, id }) {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState({
    left: anchorRect.left,
    top: anchorRect.top,
    arrowLeft: 18,
    placement: 'top',
  });

  useEffect(() => {
    const tooltipEl = tooltipRef.current;
    if (!tooltipEl) return;

    const margin = 12;
    const rect = tooltipEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = anchorRect.left;
    let top = anchorRect.top - rect.height - margin;
    let placement = 'top';

    if (top < margin) {
      top = anchorRect.bottom + margin;
      placement = 'bottom';
    }

    if (left + rect.width > viewportWidth - margin) {
      left = viewportWidth - rect.width - margin;
    }

    if (left < margin) {
      left = margin;
    }

    const anchorCenter = anchorRect.left + anchorRect.width / 2;
    const arrowLeft = Math.min(
      Math.max(anchorCenter - left - 6, 14),
      rect.width - 26,
    );

    if (top + rect.height > viewportHeight - margin) {
      top = Math.max(margin, viewportHeight - rect.height - margin);
    }

    setPosition({
      left,
      top,
      arrowLeft,
      placement,
    });
  }, [anchorRect]);

  return createPortal(
    <span
      ref={tooltipRef}
      id={id}
      className={`${styles.tooltip} ${
        position.placement === 'bottom' ? styles.tooltipBottom : ''
      }`}
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        ['--tooltip-arrow-left']: `${position.arrowLeft}px`,
      }}
      role="note"
    >
      {content}
    </span>,
    document.body,
  );
}

export default function HelpTooltip({ enabled, content, children, block = false }) {
  const wrapperRef = useRef(null);
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);

  if (!enabled || !content || !isValidElement(children)) {
    return children;
  }

  const updatePosition = () => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) {
      setAnchorRect(rect);
    }
  };

  const show = () => {
    updatePosition();
    setOpen(true);
  };

  const hide = () => setOpen(false);

  const childProps = {
    'aria-describedby': open ? tooltipId : undefined,
  };

  const wrapperClassName = `${styles.wrapper} ${block ? styles.block : ''}`;

  return (
    <span
      ref={wrapperRef}
      className={wrapperClassName}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {cloneElement(children, childProps)}
      {open && anchorRect ? (
        <TooltipLayer anchorRect={anchorRect} content={content} id={tooltipId} />
      ) : null}
    </span>
  );
}
