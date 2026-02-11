import { AuthFlowType, B2BProducts, StytchB2B } from '@stytch/react/b2b';
import React from 'react';

import { presentation } from './configuration.js';
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
      presentation={presentation}
      strings={strings}
    />
  );
};

export default ResetPassword;
