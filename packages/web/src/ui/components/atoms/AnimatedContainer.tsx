import classNames from 'classnames';
import React from 'react';

import styles from './AnimatedContainer.module.css';

const AnimatedContainer = ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) => (
  <div className={classNames(styles.container, { [styles.open]: isOpen })} aria-live="polite">
    <div className={styles.inner} aria-hidden={!isOpen}>
      {children}
    </div>
  </div>
);

export default AnimatedContainer;
