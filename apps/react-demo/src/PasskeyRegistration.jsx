import React from 'react';
import { StytchPasskeyRegistration } from '@stytch/react';
import { Products } from '@stytch/vanilla-js';
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
