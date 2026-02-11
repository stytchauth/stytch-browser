import {
  StytchAPIError,
  StytchAPISchemaError,
  StytchAPIUnreachableError,
  StytchSDKUsageError,
  useStytch,
  useStytchUser,
} from '@stytch/react';
import React, { useEffect, useRef, useState } from 'react';

import { Results } from './Results';
import { useTimer } from './timer';
import { Button, Section, WorkbenchForm } from './WorkbenchComponents';

const getCallbackURL = (type) => {
  return window.location.href.split('?')[0] + '?type=' + type;
};

const PARAMS = {
  LOCALE: { name: 'locale', kind: 'select', values: ['en', 'es', 'pt-br'] },
};

const MagicLinks = ({ dispatch, stytchUser, chompToken }) => {
  const hasEml = window.location.search.includes('eml');
  const emailLoginOrCreateRef = useRef();
  const emailSendRef = useRef();

  const magicLinksAuthenticate = () => {
    const token = chompToken();
    if (!token) {
      return;
    }
    return dispatch(
      stytch.magicLinks.authenticate(token, {
        session_duration_minutes: 60,
      }),
    );
  };

  useEffect(() => {
    if (stytchUser) {
      if (stytchUser.emails.length) {
        emailLoginOrCreateRef.current.value = stytchUser.emails[0].email;
        emailSendRef.current.value = stytchUser.emails[0].email;
      }
    }
  }, [stytchUser]);

  return (
    <Section title="Magic Links">
      <WorkbenchForm
        schema={[{ name: 'email', kind: 'string', ref: emailLoginOrCreateRef }, PARAMS.LOCALE]}
        onSubmit={(req) =>
          dispatch(
            stytch.magicLinks.email.loginOrCreate(req.email, {
              signup_magic_link_url: getCallbackURL('eml'),
              login_magic_link_url: getCallbackURL('eml'),
              locale: req.locale,
            }),
          )
        }
        methodName="stytch.magicLinks.email.loginOrCreate"
      />
      <WorkbenchForm
        schema={[{ name: 'email', kind: 'string', ref: emailSendRef }, PARAMS.LOCALE]}
        onSubmit={(req) =>
          dispatch(
            stytch.magicLinks.email.send(req.email, {
              login_magic_link_url: getCallbackURL('eml'),
              locale: req.locale,
            }),
          )
        }
        methodName="stytch.magicLinks.email.send"
      />
      <Button name="stytch.magicLinks.authenticate()" onClick={magicLinksAuthenticate} glowing={hasEml} />
    </Section>
  );
};

const Impersonation = ({ dispatch, chompToken, hasImpersonation }) => {
  const impersonationAuthenticate = () => {
    const token = chompToken();
    if (!token) {
      return;
    }
    return dispatch(
      stytch.impersonation.authenticate({
        impersonation_token: token,
        session_duration_minutes: 60,
      }),
    );
  };

  return (
    <Section title="Impersonation">
      <Button
        name="stytch.impersonation.authenticate()"
        onClick={impersonationAuthenticate}
        glowing={hasImpersonation}
      />
    </Section>
  );
};

const OTPs = ({ dispatch, stytchUser }) => {
  const otpPhoneSMSLoginOrCreateRef = useRef();
  const otpPhoneSMSSendRef = useRef();
  const otpPhoneWhatsappLoginOrCreateRef = useRef();
  const otpPhoneWhatsappSendRef = useRef();

  const otpEmailLoginOrCreateRef = useRef();
  const otpEmailSendRef = useRef();

  const otpMethodIDRef = useRef();
  const dispatchWithMethodID = async (resultProm) => {
    const result = await dispatch(resultProm);
    otpMethodIDRef.current.value = result.method_id;
  };

  useEffect(() => {
    if (stytchUser) {
      if (stytchUser.emails.length) {
        otpEmailLoginOrCreateRef.current.value = stytchUser.emails[0].email;
        otpEmailSendRef.current.value = stytchUser.emails[0].email;
      }
      if (stytchUser.phone_numbers.length) {
        otpPhoneSMSLoginOrCreateRef.current.value = stytchUser.phone_numbers[0].phone_number;
        otpPhoneSMSSendRef.current.value = stytchUser.phone_numbers[0].phone_number;
        otpPhoneWhatsappLoginOrCreateRef.current.value = stytchUser.phone_numbers[0].phone_number;
        otpPhoneWhatsappSendRef.current.value = stytchUser.phone_numbers[0].phone_number;
      }
    }
  }, [stytchUser]);

  const attachPhoneNumber = async (phone_number) => {
    if (stytchUser && !stytchUser.phone_numbers.find((pn) => (pn.phone_number = phone_number))) {
      if (window.confirm('That phone number is not attached to the logged-in user.\nAdd it?')) {
        await dispatch(
          stytch.user.update({
            phone_numbers: [{ phone_number }],
          }),
        );
      }
    }
  };

  return (
    <Section title="One Time Passcodes">
      <WorkbenchForm
        schema={[{ name: 'phone_number', kind: 'string', ref: otpPhoneSMSLoginOrCreateRef }, PARAMS.LOCALE]}
        onSubmit={async (req) => {
          await attachPhoneNumber(req.phone_number);
          dispatchWithMethodID(
            stytch.otps.sms.loginOrCreate(req.phone_number, {
              expiration_minutes: 10,
              locale: req.locale,
            }),
          );
        }}
        methodName="stytch.otps.sms.loginOrCreate"
      />
      <WorkbenchForm
        schema={[{ name: 'phone_number', kind: 'string', ref: otpPhoneSMSSendRef }, PARAMS.LOCALE]}
        onSubmit={async (req) => {
          await attachPhoneNumber(req.phone_number);
          dispatchWithMethodID(
            stytch.otps.sms.send(req.phone_number, {
              expiration_minutes: 10,
              locale: req.locale,
            }),
          );
        }}
        methodName="stytch.otps.sms.send"
      />
      <WorkbenchForm
        schema={[{ name: 'phone_number', kind: 'string', ref: otpPhoneWhatsappLoginOrCreateRef }, PARAMS.LOCALE]}
        onSubmit={async (req) => {
          await attachPhoneNumber(req.phone_number);
          dispatchWithMethodID(
            stytch.otps.whatsapp.loginOrCreate(req.phone_number, {
              expiration_minutes: 10,
              locale: req.locale,
            }),
          );
        }}
        methodName="stytch.otps.whatsapp.loginOrCreate"
      />
      <WorkbenchForm
        schema={[{ name: 'phone_number', kind: 'string', ref: otpPhoneWhatsappSendRef }, PARAMS.LOCALE]}
        onSubmit={async (req) => {
          await attachPhoneNumber(req.phone_number);
          dispatchWithMethodID(
            stytch.otps.whatsapp.send(req.phone_number, {
              expiration_minutes: 10,
              locale: req.locale,
            }),
          );
        }}
        methodName="stytch.otps.whatsapp.send"
      />
      <WorkbenchForm
        schema={[{ name: 'email', kind: 'string', ref: otpEmailLoginOrCreateRef }, PARAMS.LOCALE]}
        onSubmit={(req) =>
          dispatchWithMethodID(
            stytch.otps.email.loginOrCreate(req.email, {
              expiration_minutes: 10,
              locale: req.locale,
            }),
          )
        }
        methodName="stytch.otps.email.loginOrCreate"
      />
      <WorkbenchForm
        schema={[{ name: 'email', kind: 'string', ref: otpEmailSendRef }, PARAMS.LOCALE]}
        onSubmit={(req) =>
          dispatchWithMethodID(
            stytch.otps.email.send(req.email, {
              expiration_minutes: 10,
              locale: req.locale,
            }),
          )
        }
        methodName="stytch.otps.email.send"
      />
      <WorkbenchForm
        schema={[
          { name: 'method_id', kind: 'string', ref: otpMethodIDRef },
          { name: 'code', kind: 'string' },
        ]}
        onSubmit={(req) =>
          dispatch(
            stytch.otps.authenticate(req.code, req.method_id, {
              session_duration_minutes: 60,
            }),
          )
        }
        methodName="stytch.otps.authenticate"
      />
    </Section>
  );
};

const WorkBench = () => {
  const stytch = useStytch();
  const { user: stytchUser } = useStytchUser();
  const [result, setResult] = useState('// Click some buttons and run some code!');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLink, setIsLink] = useState(false);

  const timer = useTimer();

  const passwordEmailRef = useRef();
  const passwordRef = useRef();
  const newPasswordRef = useRef();

  const firstNameRef = useRef();
  const middleNameRef = useRef();
  const lastNameRef = useRef();
  const newEmailRef = useRef();
  const newPhoneRef = useRef();

  const webauthnRegistrationRef = useRef();
  const webauthnNameRef = useRef();
  const webauthnPasskeyRef = useRef();

  const totpCodeRef = useRef();
  const totpRecoveryCodeRef = useRef();

  const [cryptoWalletChallenge, setCryptoWalletChallenge] = useState(null);
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState(null);

  const [totp, setTotp] = useState(null);

  useEffect(() => {
    if (stytchUser) {
      firstNameRef.current.value = stytchUser.name.first_name;
      middleNameRef.current.value = stytchUser.name.middle_name;
      lastNameRef.current.value = stytchUser.name.last_name;

      webauthnRegistrationRef.current.value = stytchUser.webauthn_registrations?.at(0)?.webauthn_registration_id;
      webauthnNameRef.current.value = stytchUser.webauthn_registrations?.at(0)?.name;
    }
  }, [stytchUser]);

  const hasOauth = window.location.search.includes('oauth');
  const hasImpersonation = window.location.search.includes('impersonation');
  const chompToken = () => {
    const currentLocation = new URL(window.location.href);
    const token = currentLocation.searchParams.get('token');
    if (!token) {
      dispatch(Promise.reject(new Error('No token detected in URL - do an OAuth or a magic link flow!')));
      return null;
    }
    currentLocation.searchParams.delete('token');
    currentLocation.searchParams.delete('type');
    currentLocation.searchParams.delete('stytch_token_type');
    window.history.replaceState({}, document.title, currentLocation.toString());
    return token;
  };

  const dispatch = (prom) => {
    setIsLoading(true);
    timer.start();
    return Promise.resolve(prom)
      .then((res) => {
        setIsLink(false);
        setIsError(false);
        setIsLoading(false);
        setResult(res);
        timer.stop();
        return res;
      })
      .catch((err) => {
        setIsLink(false);
        setIsError(true);
        setIsLoading(false);
        setResult(err);
        timer.stop();
        if (err instanceof StytchSDKUsageError) {
          // eslint-disable-next-line no-console
          console.log('StytchSDKUsageError');
        } else if (err instanceof StytchAPISchemaError) {
          // eslint-disable-next-line no-console
          console.log('StytchAPISchemaError');
        } else if (err instanceof StytchAPIError) {
          // eslint-disable-next-line no-console
          console.log('StytchAPIError');
        } else if (err instanceof StytchAPIUnreachableError) {
          // eslint-disable-next-line no-console
          console.log('StytchAPIUnreachableError');
        } else {
          // eslint-disable-next-line no-console
          console.log('Unknown error type');
        }
        throw err;
      });
  };

  const authenticateByUrl = () => dispatch(stytch.authenticateByUrl({ session_duration_minutes: 60 }));

  const sessionGetSync = () => {
    dispatch(stytch.session.getSync());
  };

  const sessionGetTokens = () => {
    dispatch(stytch.session.getTokens());
  };
  const sessionAuthenticate = () => {
    return dispatch(stytch.session.authenticate());
  };
  const sessionRevoke = () => {
    return dispatch(stytch.session.revoke());
  };

  const passwordsAuthenticate = (e) => {
    e.preventDefault();
    const email = passwordEmailRef.current.value;
    const password = passwordRef.current.value;

    return dispatch(stytch.passwords.authenticate({ email, password, session_duration_minutes: 60 }));
  };

  const passwordsCreate = (e) => {
    e.preventDefault();
    const email = passwordEmailRef.current.value;
    const password = passwordRef.current.value;

    return dispatch(stytch.passwords.create({ email, password, session_duration_minutes: 60 }));
  };

  const passwordsResetByEmailStart = (e) => {
    e.preventDefault();
    const email = passwordEmailRef.current.value;

    return dispatch(
      stytch.passwords.resetByEmailStart({
        email,
        login_redirect_url: getCallbackURL('eml'),
        reset_password_redirect_url: getCallbackURL('reset'),
        reset_password_expiration_minutes: 60,
      }),
    );
  };

  const passwordsResetByEmail = (e) => {
    e.preventDefault();
    const token = chompToken();
    const password = passwordRef.current.value;

    return dispatch(
      stytch.passwords.resetByEmail({
        token,
        password,
        session_duration_minutes: 60,
      }),
    );
  };

  const passwordsResetByExistingPassword = (e) => {
    e.preventDefault();
    const email = passwordEmailRef.current.value;
    const existing_password = passwordRef.current.value;
    const new_password = newPasswordRef.current.value;

    return dispatch(
      stytch.passwords.resetByExistingPassword({
        email,
        existing_password,
        new_password,
        session_duration_minutes: 60,
      }),
    );
  };

  const passwordsResetBySession = (e) => {
    e.preventDefault();
    const password = newPasswordRef.current.value;

    return dispatch(
      stytch.passwords.resetBySession({
        password,
        session_duration_minutes: 60,
      }),
    );
  };

  const passwordsStrengthCheck = (e) => {
    e.preventDefault();
    const email = passwordEmailRef.current.value;
    const password = passwordRef.current.value;

    return dispatch(stytch.passwords.strengthCheck({ email, password }));
  };

  const userGetSync = () => {
    dispatch(stytch.user.getSync());
  };
  const userGet = () => {
    return dispatch(stytch.user.get());
  };
  const userUpdate = () => {
    const diff = {
      name: {
        first_name: firstNameRef.current.value,
        middle_name: middleNameRef.current.value,
        last_name: lastNameRef.current.value,
      },
    };

    const phone_number = newPhoneRef.current.value;
    if (phone_number) {
      diff.phone_numbers = [{ phone_number }];
    }

    const email = newEmailRef.current.value;
    if (email) {
      diff.emails = [{ email }];
    }

    return dispatch(stytch.user.update(diff));
  };

  const webAuthnRegister = async () => {
    return dispatch(stytch.webauthn.register({ is_passkey: webauthnPasskeyRef.current.value === 'on' }));
  };

  const webAuthnAuthenticate = async () => {
    return dispatch(
      stytch.webauthn.authenticate({
        session_duration_minutes: 60,
        is_passkey: webauthnPasskeyRef.current.value === 'on',
      }),
    );
  };

  const webAuthnUpdate = async () => {
    return dispatch(
      stytch.webauthn.update({
        webauthn_registration_id: webauthnRegistrationRef.current.value,
        name: webauthnNameRef.current.value,
      }),
    );
  };

  const cryptoWalletsAuthenticateStart = async (req) => {
    const [crypto_wallet_address] = await dispatch(
      window.ethereum.request({
        method: 'eth_requestAccounts',
      }),
    );
    setCryptoWalletAddress(crypto_wallet_address);

    const { challenge } = await dispatch(
      stytch.cryptoWallets.authenticateStart({
        crypto_wallet_address,
        crypto_wallet_type: 'ethereum',
        siwe_params: req,
      }),
    );
    setCryptoWalletChallenge(challenge);
  };
  const cryptoWalletsAuthenticate = async () => {
    if (!cryptoWalletChallenge) {
      return dispatch(Promise.reject(new Error('No challenge loaded. Call authenticateStart first.')));
    }
    const signature = await dispatch(
      window.ethereum.request({
        method: 'personal_sign',
        params: [cryptoWalletChallenge, cryptoWalletAddress],
      }),
    );
    await dispatch(
      stytch.cryptoWallets.authenticate({
        crypto_wallet_address: cryptoWalletAddress,
        crypto_wallet_type: 'ethereum',
        signature,
        session_duration_minutes: 60,
      }),
    );
  };

  const startFlowForProvider = (provider) => () =>
    dispatch(
      stytch.oauth[provider].start({
        signup_redirect_url: getCallbackURL('oauth'),
        login_redirect_url: getCallbackURL('oauth'),
      }),
    );

  const startOneTap = async () => {
    stytch.oauth.googleOneTap.start({
      login_redirect_url: getCallbackURL('oauth'),
      signup_redirect_url: getCallbackURL('oauth'),
    });
  };

  const resetOneTapCookie = () => {
    document.cookie = 'g_state="";expires=Thu, 01 Jan 1970 00:00:01 GMT';
  };

  const oauthAuthenticate = () => {
    const token = chompToken();
    if (!token) {
      return;
    }
    return dispatch(
      stytch.oauth.authenticate(token, {
        session_duration_minutes: 60,
      }),
    );
  };

  const totpCreate = async () => {
    const totp = await dispatch(
      stytch.totps.create({
        expiration_minutes: 5,
      }),
    );
    setTotp(totp);
  };

  const totpAuthenticate = (e) => {
    e.preventDefault();
    return dispatch(
      stytch.totps.authenticate({
        session_duration_minutes: 5,
        totp_code: totpCodeRef.current.value,
      }),
    );
  };

  const totpRecoveryCodes = () => {
    return dispatch(stytch.totps.recoveryCodes());
  };

  const totpRecover = (e) => {
    e.preventDefault();
    return dispatch(
      stytch.totps.recover({
        session_duration_minutes: 5,
        recovery_code: totpRecoveryCodeRef.current.value,
      }),
    );
  };

  const userFactorControls = [<br key="factor-brk" />];
  if (stytchUser) {
    for (const emailFactor of stytchUser.emails) {
      const onClick = () => {
        dispatch(stytch.user.deleteEmail(emailFactor.email_id));
      };
      userFactorControls.push(
        <Button key={`btn-${emailFactor.email_id}`} name={`Delete email: ${emailFactor.email}`} onClick={onClick} />,
        <br key={`brk-${emailFactor.email_id}`} />,
      );
    }

    for (const wr of stytchUser.webauthn_registrations) {
      const onClick = () => {
        dispatch(stytch.user.deleteWebauthnRegistration(wr.webauthn_registration_id));
      };
      userFactorControls.push(
        <Button
          key={`btn-${wr.webauthn_registration_id}`}
          name={`Delete WebAuthn: ${wr.webauthn_registration_id.slice(27, 35)}`}
          onClick={onClick}
        />,
        <br key={`brk-${wr.webauthn_registration_id}`} />,
      );
    }

    for (const totp of stytchUser.totps) {
      const onClick = () => {
        dispatch(stytch.user.deleteTOTP(totp.totp_id));
      };
      userFactorControls.push(
        <Button key={`btn-${totp.totp_id}`} name={`Delete TOTP: ${totp.totp_id}`} onClick={onClick} />,
        <br key={`brk-${totp.totp_id}`} />,
      );
    }

    for (const crypto_wallet of stytchUser.crypto_wallets) {
      const onClick = () => {
        dispatch(stytch.user.deleteCryptoWallet(crypto_wallet.crypto_wallet_id));
      };
      userFactorControls.push(
        <Button
          key={`btn-${crypto_wallet.crypto_wallet_id}`}
          name={`Delete Crypto Wallet: ${crypto_wallet.crypto_wallet_address}`}
          onClick={onClick}
        />,
        <br key={`brk-${crypto_wallet.crypto_wallet_id}`} />,
      );
    }
  }

  const updateSession = () => {
    stytch.session.updateSession({
      session_token: 'YOUR_SESSION_TOKEN',
      session_jwt: 'YOUR_SESSION_JWT',
    });
    return dispatch(stytch.session.authenticate());
  };

  const getConnectedApps = () => {
    return dispatch(stytch.user.getConnectedApps());
  };
  const revokedConnectedApp = (req) => {
    return dispatch(stytch.user.revokedConnectedApp(req.connectedAppId));
  };

  return (
    <>
      <div className="workbench container xl">
        <div className="column">
          <h1>SDK Workbench</h1>

          <Section title="Session">
            <Button name="stytch.session.getSync()" onClick={sessionGetSync} />
            <br />
            <Button name="stytch.session.getTokens()" onClick={sessionGetTokens} />
            <br />
            <Button name="stytch.session.authenticate()" onClick={sessionAuthenticate} />
            <br />
            <Button name="stytch.session.revoke()" onClick={sessionRevoke} />
            <br />
            <Button name="stytch.session.updateSession()" onClick={updateSession} />
            <br />
            <WorkbenchForm
              schema={[{ name: 'access_token', kind: 'string' }]}
              onSubmit={(opts) =>
                dispatch(stytch.session.exchangeAccessToken({ ...opts, session_duration_minutes: 60 }))
              }
              methodName="stytch.session.exchangeAccessToken()"
            />
            <WorkbenchForm
              schema={[
                { name: 'profile_id', kind: 'string' },
                { name: 'token', kind: 'string' },
                { name: 'session_token', kind: 'string' },
                { name: 'session_jwt', kind: 'string' },
              ]}
              onSubmit={(opts) => dispatch(stytch.session.attest({ ...opts, session_duration_minutes: 60 }))}
              methodName="stytch.session.attest()"
            />
          </Section>
          <Section title="User">
            <Button name="stytch.user.getSync()" onClick={userGetSync} />
            <br />
            <Button name="stytch.user.get()" onClick={userGet} />
            <br />
          </Section>
          <MagicLinks dispatch={dispatch} stytchUser={stytchUser} chompToken={chompToken} />
          <Impersonation dispatch={dispatch} chompToken={chompToken} hasImpersonation={hasImpersonation} />

          <hr />

          <Button
            name="stytch.authenticateByUrl()"
            onClick={authenticateByUrl}
            glowing={stytch.parseAuthenticateUrl()?.handled}
          />

          <h3>Connected Apps</h3>
          <WorkbenchForm schema={[]} onSubmit={getConnectedApps} methodName="stytch.user.getConnectedApps()" />
          <WorkbenchForm
            schema={[{ name: 'connectedAppId', kind: 'string' }]}
            onSubmit={(req) => revokedConnectedApp(req)}
            methodName="stytch.user.revokeConnectedApp()"
          />
          <h3>Passwords</h3>
          <form onSubmit={passwordsAuthenticate}>
            <div className="inputContainer">
              <label htmlFor="pw-email">Email:</label>
              <input type="text" id="email" name="email" ref={passwordEmailRef} required />
            </div>
            <div className="inputContainer">
              <label htmlFor="password">Password:</label>
              <input type="text" id="email" name="email" ref={passwordRef} required />
            </div>
            <Button name="stytch.passwords.authenticate()" type="submit" />
            <br />
          </form>
          <Button name="stytch.passwords.create()" onClick={passwordsCreate} />
          <br />
          <Button name="stytch.passwords.resetByEmailStart()" onClick={passwordsResetByEmailStart} />
          <br />
          <Button name="stytch.passwords.resetByEmail()" onClick={passwordsResetByEmail} />
          <br />
          <form onSubmit={passwordsResetByExistingPassword}>
            <div className="inputContainer">
              <label htmlFor="new_password">New Password:</label>
              <input type="text" id="new_password" name="new_password" ref={newPasswordRef} required />
            </div>
            <Button name="stytch.passwords.resetByExistingPassword()" type="submit" />
            <br />
          </form>
          <Button name="stytch.passwords.resetBySession()" onClick={passwordsResetBySession} />
          <br />
          <Button name="stytch.passwords.strengthCheck()" onClick={passwordsStrengthCheck} />
          <br />
          <OTPs stytchUser={stytchUser} dispatch={dispatch} />
          <h3>WebAuthn</h3>
          <Button name="stytch.webauthn.register()" onClick={webAuthnRegister} />
          <br />
          <Button name="stytch.webauthn.authenticate()" onClick={webAuthnAuthenticate} />
          <br />
          <div className="inputContainer">
            <label htmlFor="passkey">Is Passkey?</label>
            <input type="checkbox" id="passkey" name="passkey" ref={webauthnPasskeyRef} />
          </div>
          <div className="inputContainer">
            <label htmlFor="update_webauthn">Update WebAuthn Registration:</label>
            <input type="text" id="update_webauthn" name="update_webauthn" ref={webauthnRegistrationRef} />
          </div>
          <div className="inputContainer">
            <label htmlFor="update_name">Update WebAuthn Name:</label>
            <input type="text" id="update_name" name="update_name" ref={webauthnNameRef} />
          </div>
          <Button name="stytch.webauthn.update()" onClick={webAuthnUpdate} />
          <h3>Crypto Wallets</h3>
          <div>
            <label>Crypto Wallet Address Shared:</label>
            <input type="checkbox" disabled checked={Boolean(cryptoWalletAddress)} />
          </div>
          <div>
            <label>Crypto Wallet Challenge Loaded:</label>
            <input type="checkbox" disabled checked={Boolean(cryptoWalletChallenge)} />
          </div>
          <WorkbenchForm
            schema={[
              { name: 'uri', kind: 'string' },
              { name: 'chain_id', kind: 'string' },
              { name: 'statement', kind: 'string' },
              { name: 'issued_at', kind: 'string' },
              { name: 'not_before', kind: 'string' },
              { name: 'message_request_id', kind: 'string' },
              { name: 'resources', kind: 'string', is_csv: true },
            ]}
            onSubmit={(req) => cryptoWalletsAuthenticateStart(req)}
            methodName="stytch.cryptoWallets.authenticateStart()"
          />
          <br />
          <Button name="stytch.cryptoWallets.authenticate()" onClick={cryptoWalletsAuthenticate} />
          <br />
          <h3>OAuth</h3>
          <Button name="stytch.oauth.google.start()" onClick={startFlowForProvider('google')} />
          <br />
          <Button name="stytch.oauth.googleOneTap.start()" onClick={startOneTap} />
          <br />
          <Button name="Reset One Tap" onClick={resetOneTapCookie} />
          <br />
          <Button name="stytch.oauth.authenticate()" onClick={oauthAuthenticate} glowing={hasOauth} />
          <br />
          <h3>TOTP</h3>
          <Button name="stytch.totps.create()" onClick={totpCreate} />
          <br />
          <form onSubmit={totpAuthenticate}>
            <div className="inputContainer">
              <label htmlFor="code">Code:</label>
              <input required type="text" id="code" name="code" ref={totpCodeRef} />
            </div>
            <button type="submit">
              <code>stytch.totps.authenticate()</code>
            </button>
          </form>
          <Button name="stytch.totps.recoveryCodes()" onClick={totpRecoveryCodes} />
          <br />
          <form onSubmit={totpRecover}>
            <div className="inputContainer">
              <label htmlFor="recovery_code">Recovery Code:</label>
              <input required type="text" id="recovery_code" name="recovery_code" ref={totpRecoveryCodeRef} />
            </div>
            <button type="submit">
              <code>stytch.totps.recover()</code>
            </button>
          </form>
          <h3>User Management</h3>
          <div className="inputContainer">
            <label htmlFor="first_name">First Name:</label>
            <input type="text" id="first_name" name="first_name" ref={firstNameRef} />
          </div>
          <div className="inputContainer">
            <label htmlFor="middle_name">Middle Name:</label>
            <input type="text" id="middle_name" name="middle_name" ref={middleNameRef} />
          </div>
          <div className="inputContainer">
            <label htmlFor="last_name">Last Name:</label>
            <input type="text" id="last_name" name="last_name" ref={lastNameRef} />
          </div>
          <div className="inputContainer">
            <label htmlFor="new_email">Add Email:</label>
            <input type="text" id="new_email" name="new_email" ref={newEmailRef} />
          </div>
          <div className="inputContainer">
            <label htmlFor="new_phone">Add Phone #:</label>
            <input type="text" id="new_phone" name="new_phone" ref={newPhoneRef} />
          </div>
          <Button name="stytch.user.update()" onClick={userUpdate} />
          <br />
          {userFactorControls.length > 1 ? <strong>Attached Factors</strong> : null}
          {userFactorControls}
        </div>
        <div className="resultcontainer">
          <h3>You are {stytchUser ? 'logged in.' : 'not logged in.'}</h3>
          {totp ? (
            <div>
              <h3>TOTP QR Code:</h3> <img src={totp.qr_code} />
            </div>
          ) : null}
          <h3>Result: {isLoading ? '...' : ''}</h3>
          <Results className="results" content={result} isError={isError} isLink={isLink} />
          {timer.duration && <b>{Math.floor(timer.duration)} ms</b>}
        </div>
      </div>
    </>
  );
};

export default WorkBench;
