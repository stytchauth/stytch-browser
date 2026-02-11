import { useLingui } from '@lingui/react/macro';
import classNames from 'classnames';
import React from 'react';

import VisuallyHidden from '../atoms/VisuallyHidden';
import styles from './PasswordStrengthCheck.module.css';

export const PasswordStrengthCheck = ({ score }: { score?: number }) => {
  const { t } = useLingui();

  let status: string | undefined;
  if (score === 1 || score === 2) {
    status = styles.weak;
  } else if (score === 3 || score === 4) {
    status = styles.strong;
  }

  return (
    <div className={classNames(styles.container, status)}>
      {score != null && score > 0 && (
        <>
          {new Array(4).fill(undefined).map((_, i) => (
            <div key={i} className={classNames(styles.block, { [styles.filled]: score > i })} />
          ))}
          <VisuallyHidden>
            {t({ id: 'password.strength', message: `Password strength: ${score} out of 4.` })}
          </VisuallyHidden>
        </>
      )}
    </div>
  );
};
