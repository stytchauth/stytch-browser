import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useErrorCallback, useEventCallback, useStytch } from '../../GlobalContextProvider';
import { useStytchUser } from '../../../hooks/useStytchUser';
import { ErrorDisplay } from '../../../components/ErrorScreen';
import { useBootstrap } from '../../utils';
import { IDPConsent, useIDPState } from '../../../components/IDPConsent';
import { OAuthAuthorizeParams, OAuthLogoutParams, parseIDPParams } from '../../../../utils/idpHelpers';
import { IDPLogout, useLogoutState } from '../../../components/IDPLogout';
import { useTrustedAuthTokenParams } from '../../../components/IDPContextProvider';
import { AuthTokenParams } from '../../../../types';
import { NoCurrentSessionError } from '@stytch/core/public';
import { LoadingScreen } from '../../../components/Loading';

const IDPConsentScreenImpl = ({
  initialError,
  initialParams,
}: {
  initialError: string | null;
  initialParams: OAuthAuthorizeParams;
}) => {
  const stytchClient = useStytch();
  const onError = useErrorCallback();
  const onEvent = useEventCallback();
  const { oauthAuthorizeStart, oauthAuthorizeSubmit } = stytchClient.idp;

  const { bootstrap, fromCache: bootstrapNotLoaded } = useBootstrap();

  const idpConsentInfo = useIDPState({
    initialError,
    initialParams,
    oauthAuthorizeStart,
    oauthAuthorizeSubmit,
    onError,
    onEvent,
  });

  return <IDPConsent bootstrap={bootstrap} bootstrapNotLoaded={bootstrapNotLoaded} {...idpConsentInfo}></IDPConsent>;
};

const IDPLogoutScreenImpl = ({
  initialError,
  initialParams,
}: {
  initialError: string | null;
  initialParams: OAuthLogoutParams;
}) => {
  const stytchClient = useStytch();
  const onError = useErrorCallback();
  const { oauthLogoutStart } = stytchClient.idp;
  const revokeSession = () => stytchClient.session.revoke({ forceClear: true });

  const { bootstrap, fromCache: bootstrapNotLoaded } = useBootstrap();
  const idpLogoutState = useLogoutState({
    initialError,
    initialParams,
    oauthLogoutStart,
    revokeSession,
    onError,
  });

  return <IDPLogout {...idpLogoutState} bootstrap={bootstrap} bootstrapNotLoaded={bootstrapNotLoaded} />;
};

export const IDPConsentScreen = () => {
  // Preserve the URL Params seen on first render - even if they change later
  const [{ flow, error }] = useState(parseIDPParams(window.location.search));

  switch (flow.type) {
    case 'Authorize':
      return (
        <EnsureUserIsLoggedIn>
          <IDPConsentScreenImpl initialError={error} initialParams={flow.params} />
        </EnsureUserIsLoggedIn>
      );

    case 'Logout':
      return <IDPLogoutScreenImpl initialError={error} initialParams={flow.params} />;
  }
};

const EnsureUserIsLoggedIn = ({ children }: { children: ReactNode }) => {
  const { t } = useLingui();
  const user = useStytchUser();
  const onError = useErrorCallback();
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // if a trusted auth token is provided, attest it before rendering the consent screen
  const stytchClient = useStytch();
  const authParams = useTrustedAuthTokenParams();
  const [attesting, setAttesting] = useState(false);
  const [attested, setAttested] = useState(false);

  useEffect(() => {
    if (attesting || attested) return;

    const attestTrustedToken = async (authParams: AuthTokenParams | undefined): Promise<void> => {
      if (authParams?.trustedAuthToken && authParams?.tokenProfileID) {
        setAttesting(true);
        const token = authParams.trustedAuthToken;
        const profile_id = authParams.tokenProfileID;

        // revoke the current session before calling attest
        if (stytchClient.user.getSync()) {
          await stytchClient.session.revoke({ forceClear: true });
        }

        try {
          await stytchClient.session.attest({
            token,
            profile_id,
            session_duration_minutes: 60,
          });
        } catch (error) {
          onErrorRef.current(error as Error);
        } finally {
          setAttesting(false);
          setAttested(true);
        }
      }
      // set this either way to short-circuit the useEffect below
      setAttested(true);
    };
    attestTrustedToken(authParams);
  }, [authParams, attesting, attested, stytchClient]);

  useEffect(() => {
    if (user) return;
    onErrorRef.current(new NoCurrentSessionError());
  }, [user]);

  if (attesting) {
    return <LoadingScreen />;
  } else if (user) {
    return children;
  } else {
    return (
      <ErrorDisplay
        text={t({
          id: 'idpConsent.noActiveSession',
          message: 'No active session detected. Please log in to continue.',
        })}
      />
    );
  }
};
