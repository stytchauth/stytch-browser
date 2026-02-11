import classNames from 'classnames';
import React, { forwardRef, HTMLAttributes } from 'react';

import styles from './Typography.module.css';

export type TypographyProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'header' | 'body' | 'helper';
  color?: 'foreground' | 'muted' | 'destructive' | 'warning' | 'success';
  align?: 'start' | 'center' | 'end';
  font?: 'default' | 'mono';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  as?: string;
};

const Typography = forwardRef<HTMLDivElement, TypographyProps>(
  ({ variant = 'body', as = 'div', weight, font, color, align, className, ...props }, ref) => {
    // Without this cast, TS thinks Element might not even be an HTML element and so does not have className
    const Element = as as 'div';
    return (
      <Element
        {...props}
        ref={ref}
        className={classNames(
          className,
          styles.typography,
          styles[variant],
          font && styles[font + 'Font'],
          weight && styles[weight],
          color && styles[color],
          align && styles[align],
        )}
      />
    );
  },
);

export default Typography;
