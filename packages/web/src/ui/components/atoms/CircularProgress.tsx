import { useLingui } from '@lingui/react/macro';
import React from 'react';

import styles from './CircularProgress.module.css';

const BASE_SIZE = 44;

export type CircularProgressProps = {
  size: number;
  thickness?: number;
  label?: string;
};

/**
 * A lightweight spinning circle loading animation heavily inspired by the
 * MUI CircularProgress component
 * https://github.com/mui/material-ui/blob/master/packages/mui-material/src/CircularProgress/CircularProgress.js
 */
export const CircularProgress = ({ size, label, thickness = 3.6 }: CircularProgressProps) => {
  const { t } = useLingui();
  return (
    <div className={styles.root} style={{ width: size, height: size }}>
      <svg
        className={styles.svg}
        viewBox={`${BASE_SIZE / 2} ${BASE_SIZE / 2} ${BASE_SIZE} ${BASE_SIZE}`}
        aria-label={label ?? t({ id: 'loading.label', message: 'Loading' })}
      >
        <circle
          className={styles.animatedCircle}
          cx={BASE_SIZE}
          cy={BASE_SIZE}
          r={(BASE_SIZE - thickness) / 2}
          fill="none"
          strokeWidth={thickness}
        />
      </svg>
    </div>
  );
};
