import classNames from 'classnames';
import React, { forwardRef, InputHTMLAttributes, ReactNode, useLayoutEffect, useRef, useState } from 'react';

import { useUniqueId } from '../../../utils/uniqueId';
import VisuallyHidden from '../atoms/VisuallyHidden';
import { usePresentation } from '../PresentationConfig';
import ErrorText from './ErrorText';
import styles from './Input.module.css';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  containerClassName?: string;
  hideLabel?: boolean;
  action?: ReactNode;
  error?: string;
};

/**
 * Generic low level text Input element
 * A label must be provided for accessibility, but can be hidden using the `hideLabel` prop
 * You may want to use a more specific component in /molecules instead like {@link EmailInput}, {@link PasswordInput}
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label: labelText, hideLabel, action, id: idProp, containerClassName, error, ...props }, ref) => {
    const presentation = usePresentation();
    const id = idProp + (presentation.options?.inputIdSuffix ?? '');

    const errorId = useUniqueId();

    // Calculate the width of the action element and add it to the input padding so the input content
    // cannot go behind the action
    const actionRef = useRef<HTMLDivElement>(null);
    const [actionWidth, setActionWidth] = useState<number>();
    useLayoutEffect(() => {
      if (actionRef.current) {
        // getBoundingClientRect accounts for transformations while clientWidth does not
        setActionWidth(actionRef.current.getBoundingClientRect().width);
      }
    }, [action]);

    const label = (
      <label className={styles.label} htmlFor={id}>
        {labelText}
      </label>
    );

    if (error) {
      props['aria-invalid'] = true;
      props['aria-errormessage'] = errorId;
    }

    return (
      <div className={classNames(containerClassName, styles.container)}>
        {hideLabel ? <VisuallyHidden>{label}</VisuallyHidden> : label}

        <div className={styles.inputWrapper}>
          <input
            ref={ref}
            id={id}
            className={classNames(className, styles.input)}
            style={
              actionWidth
                ? {
                    // spacing-4 because action has a 2 unit horizontal margin
                    paddingInlineEnd: `calc(${actionWidth}px + var(--st-spacing-4))`,
                  }
                : undefined
            }
            {...props}
          />
          {action && (
            <div ref={actionRef} className={styles.action}>
              {action}
            </div>
          )}
        </div>

        {error && (
          <ErrorText id={errorId} className={styles.error} aria-live="polite">
            {error}
          </ErrorText>
        )}
      </div>
    );
  },
);

export default Input;
