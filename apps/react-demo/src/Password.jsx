import { Products, StytchLogin, useStytch } from '@stytch/react';
import React from 'react';

const passwordOptions = {
  loginRedirectURL: `${window.location.origin}/reset`,
  resetPasswordRedirectURL: `${window.location.origin}/reset`,
  resetPasswordExpirationMinutes: 60,
};

const emlRedirectURLs = {
  loginRedirectURL: `${window.location.origin}/?type=eml`,
  signupRedirectURL: `${window.location.origin}/?type=eml`,
};

export const PasswordOnly = () => {
  const stytchClient = useStytch();

  const resetSession = () => stytchClient.session.revoke().then(() => alert('Session revoked'));
  return (
    <div>
      <div>
        <button onClick={resetSession}>Reset Session</button>
      </div>

      <h1>Password Only</h1>
      <StytchLogin
        config={{
          products: [Products.passwords],
          passwordOptions: passwordOptions,
        }}
      />
    </div>
  );
};

export const PasswordEML = () => {
  const stytchClient = useStytch();

  const resetSession = () => stytchClient.session.revoke().then(() => alert('Session revoked'));
  return (
    <div>
      <div>
        <button onClick={resetSession}>Reset Session</button>
      </div>

      <h1>Password + EML</h1>
      <StytchLogin
        config={{
          products: [Products.emailMagicLinks, Products.passwords],
          passwordOptions: passwordOptions,
          emailMagicLinksOptions: emlRedirectURLs,
        }}
      />
    </div>
  );
};

export const PasswordOTP = () => {
  const stytchClient = useStytch();

  const resetSession = () => stytchClient.session.revoke().then(() => alert('Session revoked'));
  return (
    <div>
      <div>
        <button onClick={resetSession}>Reset Session</button>
      </div>

      <h1>Password + OTP</h1>
      <StytchLogin
        config={{
          products: [Products.otp, Products.passwords],
          passwordOptions: passwordOptions,
          otpOptions: {
            methods: ['email', 'sms', 'whatsapp'],
            expirationMinutes: 10,
          },
        }}
      />
    </div>
  );
};
