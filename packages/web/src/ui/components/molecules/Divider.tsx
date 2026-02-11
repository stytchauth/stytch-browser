import { useLingui } from '@lingui/react/macro';
import React from 'react';

import Typography from '../atoms/Typography';
import styles from './Divider.module.css';

const Divider = () => {
  const { t } = useLingui();

  return (
    <div role="separator" className={styles.container}>
      <div className={styles.bar} />
      <Typography variant="helper">{t({ id: 'methodDivider.text', message: 'or' })}</Typography>
      <div className={styles.bar} />
    </div>
  );
};

export default Divider;
