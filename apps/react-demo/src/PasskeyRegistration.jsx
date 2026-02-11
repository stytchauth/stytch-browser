import { Products, StytchPasskeyRegistration } from '@stytch/react';
import React from 'react';

import { useB2CStrings } from './useStrings';

export const PasskeyRegistration = () => {
  const strings = useB2CStrings();

  return (
    <div style={{ marginTop: '24px' }}>
      <StytchPasskeyRegistration
        config={{
          products: [Products.passkeys],
        }}
        strings={strings}
      />
    </div>
  );
};
