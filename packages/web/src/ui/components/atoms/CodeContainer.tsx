import classNames from 'classnames';
import React, { HTMLAttributes } from 'react';

import styles from './CodeContainer.module.css';

export type CodeContainerProps = HTMLAttributes<HTMLDivElement>;

const CodeContainer: React.FC<CodeContainerProps> = ({ children, className, ...props }) => (
  <div className={classNames(className, styles.container)} {...props}>
    {children}
  </div>
);

export default CodeContainer;
