import classNames from 'classnames';
import React, { FormHTMLAttributes, forwardRef, HTMLAttributes } from 'react';

import styles from './Column.module.css';

export type ColumnProps = (
  | ({ as?: 'div' } & HTMLAttributes<HTMLDivElement>)
  | ({ as: 'form' } & FormHTMLAttributes<HTMLFormElement>)
) & {
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
};

/**
 * Utility for basic column layout. Use custom styling or className for more complex cases.
 */
const Column = forwardRef<HTMLDivElement, ColumnProps>(
  ({ as = 'div', gap, className, style: outerStyle, ...props }, ref) => {
    const Element = as as 'div';
    const style = { ...outerStyle };
    if (gap != null) {
      style.gap = gap === 1 ? 'var(--st-spacing)' : `var(--st-spacing-${gap})`;
    }

    return (
      <Element
        ref={ref}
        className={classNames(className, styles.column)}
        style={style}
        {...(props as HTMLAttributes<HTMLDivElement>)}
      />
    );
  },
);

export default Column;
