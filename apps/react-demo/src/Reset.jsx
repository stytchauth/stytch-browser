import { StytchPasswordReset } from '@stytch/react';
import React from 'react';

import { useB2CStrings } from './useStrings';

const Reset = () => {
  const strings = useB2CStrings();

  return (
    <div style={{ marginTop: '24px' }}>
      <StytchPasswordReset strings={strings} />
    </div>
  );
};

export default Reset;
