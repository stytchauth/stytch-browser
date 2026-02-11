import React, { useState, useEffect } from 'react';
import { StytchPasswordReset } from '@stytch/react';
import { Products } from '@stytch/vanilla-js';
import { useB2CStrings } from './useStrings';

const Reset = () => {
  const [passwordResetToken, setPasswordResetToken] = useState('');
  const strings = useB2CStrings();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    setPasswordResetToken(token ?? '');
  }, []);

  return (
    <div style={{ marginTop: '24px' }}>
      <StytchPasswordReset
        config={{
          products: [Products.emailMagicLinks],
          emailMagicLinksOptions: {
            loginRedirectURL: `${window.location.origin}/?type=eml`,
            signupRedirectURL: `${window.location.origin}/?type=eml`,
          },
        }}
        passwordResetToken={passwordResetToken}
        strings={strings}
      />
    </div>
  );
};

export default Reset;
