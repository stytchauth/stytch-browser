import classNames from 'classnames';
import React from 'react';

import Typography from '../atoms/Typography';
import styles from './Badge.module.css';

type BadgeProps = {
  className?: string;
  children: string;
};

export const Badge = ({ className, children }: BadgeProps) => (
  <div className={classNames(styles.badge, className)}>
    <Typography variant="helper">{children}</Typography>
  </div>
);
