import { useLingui } from '@lingui/react/macro';
import * as React from 'react';

import { CircularProgress } from '../atoms/CircularProgress';
import Typography from '../atoms/Typography';
import styles from './Loading.module.css';

export const LoggingInScreen = () => {
  const { t } = useLingui();
  return (
    <Typography variant="header" align="center">
      {t({ id: 'login.loading', message: 'Logging in...' })}
    </Typography>
  );
};

export const LoadingScreen = () => (
  <div className={styles.loadingScreen}>
    <CircularProgress size={32} />
  </div>
);
