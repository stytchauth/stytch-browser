import classNames from 'classnames';
import React, { ReactNode, useEffect, useState } from 'react';

import styles from './VerticalTransition.module.css';

/**
 * Returns a state that automatically reset itself after a given number of seconds
 * @see {useCountdown} for an alternative that returns a countdown in seconds
 */
export function useTimedBoolean(timeoutSeconds: number) {
  const [state, setState] = useState(false);

  useEffect(() => {
    if (!state || !timeoutSeconds) return;
    const handler = setTimeout(() => setState(false), timeoutSeconds * 1000);
    return () => clearTimeout(handler);
  }, [state, timeoutSeconds]);
  return [state, setState] as const;
}

export type VerticalTransitionProps = {
  primary: ReactNode;
  secondary: ReactNode;

  /** Customize the root class name. This element clips the two child */
  rootClassName?: string;

  /** Customize the two containers of primary and secondary */
  className?: string;
} & (
  | {
      /**
       * Default. Rely on the triggered boolean to control whether primary or secondary is displayed.
       * Has aria-live, and only one of primary and secondary has aria-hidden="false"
       */
      trigger?: 'manual';

      /**
       * Primary is displayed if false, secondary if true
       */
      triggered: boolean;
    }
  | {
      /**
       * This element must be a child of a parent that has the hoverTriggerClass class attached.
       * Both primary and secondary are always visible to screen readers
       */
      trigger: 'hover';

      /** Can be used to override the hover trigger */
      triggered?: boolean;
    }
);

export const hoverTriggerClass = styles.hoverTrigger;

/**
 * Toggles between primary and secondary content by sliding vertically.
 *
 * The two provided elements are placed in containers which both share the same height
 * and width of primary's content.
 *
 * Use the trigger prop to set what toggles between primary and secondary:
 * - manual: Default. Rely on the triggered boolean to control whether primary or secondary is displayed.
 *           Has aria-live, and only one of primary and secondary has aria-hidden="false"
 * - hover: This element must be a child of a parent that has the hoverTriggerClass class attached.
 *          Both primary and secondary are always visible to screen readers
 */
const VerticalTransition = ({
  primary,
  secondary,
  rootClassName,
  className,
  trigger = 'manual',
  triggered,
}: VerticalTransitionProps) => (
  <div
    className={classNames(rootClassName, styles.container, {
      [styles.triggered]: triggered,
      [styles.canTriggerByHover]: trigger === 'hover',
    })}
    // The manually triggered version is an aria-live region since it is meant to replace toasts for ephemeral updates.
    // The hover version is meant more for decorative elements, so we don't give it any special accessibility treatment
    aria-live={trigger === 'manual' ? 'polite' : undefined}
  >
    <div className={classNames(className, styles.primary)} aria-hidden={trigger === 'manual' ? triggered : undefined}>
      {primary}
    </div>
    <div
      className={classNames(className, styles.secondary)}
      aria-hidden={trigger === 'manual' ? !triggered : undefined}
    >
      {secondary}
    </div>
  </div>
);

export default VerticalTransition;
