import React from 'react';

import styles from './LoadingBar.module.css';

/**
 * A fake loading bar that goes to 100% over 10s
 */
const LoadingBar = ({ isLoading }: { isLoading: boolean }) => (
  <div role="progressbar" className={styles.container}>
    {isLoading && <div className={styles.progress} />}
  </div>
);

export default LoadingBar;
