import React from 'react';
import { StytchB2B } from '@stytch/react/b2b';
import { B2BProducts, AuthFlowType } from '@stytch/vanilla-js/b2b';
import { useB2BStrings } from './useStrings';

const ResetPassword = () => {
  const strings = useB2BStrings();
  return (
    <StytchB2B
      config={{
        products: [B2BProducts.passwords],
        sessionOptions: { sessionDurationMinutes: 60 },
        authFlowType: AuthFlowType.PasswordReset,
        passwordOptions: {
          loginRedirectURL: window.location.origin,
          resetPasswordRedirectURL: window.location.origin + '/reset',
          resetPasswordExpirationMinutes: 60,
        },
      }}
      strings={strings}
    />
  );
};

export default ResetPassword;
