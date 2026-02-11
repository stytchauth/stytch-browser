import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useStytchMember } from '../hooks/useStytchMember';
import { IDPConsent, useIDPState } from '../../components/IDPConsent';
import { useErrorCallback, useEventCallback, useStytch } from '../GlobalContextProvider';
import { useBootstrap } from '../utils';
import { ErrorDisplay } from '../../components/ErrorScreen';
import { NoCurrentSessionError } from '@stytch/core/public';
import { OAuthAuthorizeParams, OAuthLogoutParams, parseIDPParams } from '../../../utils/idpHelpers';
import { IDPLogout, useLogoutState } from '../../components/IDPLogout';
import { useTrustedAuthTokenParams } from '../../components/IDPContextProvider';
import { AuthTokenParams } from '../../../types';
import { LoadingScreen } from '../../components/Loading';

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

  // TODO: Consumer and B2B Bootstrap hooks should return same shape
  const bootstrap = useBootstrap();

  const idpConsentState = useIDPState({
    initialError,
    initialParams,
    oauthAuthorizeStart,
    oauthAuthorizeSubmit,
    onError,
    onEvent,
  });

  return <IDPConsent bootstrap={bootstrap} bootstrapNotLoaded={false} {...idpConsentState} />;
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

  const bootstrap = useBootstrap();
  const idpLogoutState = useLogoutState({
    initialError,
    initialParams,
    oauthLogoutStart,
    revokeSession,
    onError,
  });

  return <IDPLogout {...idpLogoutState} bootstrap={bootstrap} bootstrapNotLoaded={false} />;
};

export const IDPConsentScreen = ({
  searchParams = window.location.search,
}: {
  searchParams?: string;
} = {}) => {
  // Preserve the URL Params seen on first render - even if they change later
  const [{ flow, error }] = useState(parseIDPParams(searchParams));

  switch (flow.type) {
    case 'Authorize':
      return (
        <EnsureMemberIsLoggedIn>
          <IDPConsentScreenImpl initialError={error} initialParams={flow.params} />
        </EnsureMemberIsLoggedIn>
      );

    case 'Logout':
      return <IDPLogoutScreenImpl initialError={error} initialParams={flow.params} />;
  }
};

const EnsureMemberIsLoggedIn = ({ children }: { children: ReactNode }) => {
  const { t } = useLingui();
  const member = useStytchMember();
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
        // store the member to refer to its organization_id later
        const member = stytchClient.self.getSync();
        if (member) {
          await stytchClient.session.revoke();
        }
        try {
          await stytchClient.session.attest({
            token,
            profile_id,
            organization_id: member?.organization_id,
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
    if (member) return;
    onErrorRef.current(new NoCurrentSessionError());
  }, [member]);

  if (attesting) {
    return <LoadingScreen />;
  } else if (member) {
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
