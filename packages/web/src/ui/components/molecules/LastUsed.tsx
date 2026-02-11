import { useLingui } from '@lingui/react/macro';
import React, { ReactNode } from 'react';

import { Badge } from './Badge';
import styles from './LastUsed.module.css';

const LastUsed = ({ children }: { children: ReactNode }) => {
  const { t } = useLingui();

  return (
    <div className={styles.container}>
      {children}
      <Badge className={styles.badge}>{t({ id: 'provider.lastUsed', message: 'Last used' })}</Badge>
    </div>
  );
};

export default LastUsed;
