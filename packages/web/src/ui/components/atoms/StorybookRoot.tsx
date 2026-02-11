import '../mixins';

import classNames from 'classnames';
import React, { ReactNode, useRef } from 'react';

import styles from '../mixins/Root.module.css';
import { useRootStyles } from '../molecules/MainContainer';
import { Theme } from '../themes/ThemeConfig';

export const StorybookRoot = ({ children, theme }: { children: ReactNode; theme: Theme }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { className, style } = useRootStyles(theme, ref);
  return (
    <div
      ref={ref}
      style={{
        // To set --storybook-width, use the rootWidth global parameter
        maxWidth: 'var(--storybook-width, 400px)',
        ...style,
      }}
      className={classNames(styles.root, className)}
    >
      {children}
    </div>
  );
};
