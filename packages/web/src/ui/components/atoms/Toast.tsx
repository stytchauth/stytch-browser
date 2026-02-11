import React, { useEffect, useRef } from 'react';

import { getTransitionDuration } from './animation';
import styles from './Toast.module.css';

const DEFAULT_DURATION = 10_000;

type Toast = {
  message: string;
  durationMs?: number;
};

// Really simple event bus. We assume ToastContainer is always mounted so no error handling in case there's
// no listeners
const listeners: ((newToast: Toast) => void)[] = [];
export function errorToast(toast: Toast) {
  for (const listener of listeners) {
    listener(toast);
  }
}

const steps = {
  start: { opacity: 0, translate: '0 var(--st-spacing-2)' },
  end: { opacity: 1, translate: '0' },
};

function animateToastOut(element: HTMLElement, duration: number) {
  const animation = element.animate([steps.end, steps.start], { duration, easing: 'ease-in-out' });
  animation.addEventListener('finish', () => element.remove());
}

export const ToastContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>();
  const timeoutRef = useRef<number>();

  // We're just going to run all of these via manual DOM manipulation since we want finer control over the element
  // lifecycle than React is going to give us
  useEffect(() => {
    const listener = (toast: Toast) => {
      if (!containerRef.current) return;

      const duration = getTransitionDuration(containerRef.current) * 2;

      const toastElement = document.createElement('div');
      toastElement.textContent = toast.message;
      toastElement.className = styles.toast;

      // Animate existing toast out
      if (toastRef.current) animateToastOut(toastRef.current, duration);

      // Create new toast and animate in
      containerRef.current.appendChild(toastElement);
      toastRef.current = toastElement;
      toastElement.animate([steps.start, steps.end], { duration, easing: 'ease-in-out' });

      // Animate out after set duration
      timeoutRef.current = window.setTimeout(() => {
        if (!toastRef.current) return;
        animateToastOut(toastRef.current, duration);
        toastRef.current = undefined;
      }, toast.durationMs ?? DEFAULT_DURATION);
    };

    listeners.push(listener);
    return () => {
      clearTimeout(timeoutRef.current);
      const index = listeners.indexOf(listener);
      if (index !== -1) listeners.splice(index, 1);
    };
  }, []);

  return <div className={styles.container} ref={containerRef} aria-live="polite"></div>;
};
