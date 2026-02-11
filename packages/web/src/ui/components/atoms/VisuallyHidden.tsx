import classNames from 'classnames';
import React, { ReactNode } from 'react';

import styles from './VisuallyHidden.module.css';

const VisuallyHidden = ({ children, focusable }: { children: ReactNode; focusable?: boolean }) => (
  <div className={classNames(focusable ? styles.focusable : styles.hidden)}>{children}</div>
);

export default VisuallyHidden;
