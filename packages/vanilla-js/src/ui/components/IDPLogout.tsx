import React, { useCallback, useEffect, useReducer } from 'react';
import { useLingui } from '@lingui/react/macro';
import { OAuthLogoutParams } from '../../utils/idpHelpers';
import { OAuthLogoutStartOptions, OAuthLogoutStartResponse } from '@stytch/core/public';
import { LoadingScreen } from './Loading';
import { ErrorDisplay } from './ErrorScreen';
import { Confirmation } from './Confirmation';
import { Flex } from './Flex';
import Button from './Button';
import { Text } from './Text';
import { IDPOAuthFlowMissingParamError, StytchAPIError, StytchSDKUIError } from '@stytch/core/public';
import { BootstrapData } from '@stytch/core';

type Action =
  | { type: 'START_PREFLIGHT' }
  | { type: 'PREFLIGHT_ERROR'; error: string }
  | {
      type: 'COMPLETE_PREFLIGHT';
      consent_required: boolean;
      redirect_uri: string;
    }
  | { type: 'CONSENT_DENIED' };

type LogoutState = {
  // True if there is a request in progress
  loading: boolean;
  // True if we have kicked off the preflight request
  preflight: boolean;
  error: string | null;
  // True if logout has been denied by the end user
  denied: boolean;
  // Preflight results: Do we need to ask for consent? Who is asking?
  consent_required: boolean;
  // Preflight results: Where do we go afterward?
  redirect_uri: string;
};

const initialState = (error: string | null): LogoutState => ({
  loading: !error,
  preflight: !!error,
  error: error,
  denied: false,
  consent_required: false,
  redirect_uri: '',
});

const logoutStateReducer = (state: LogoutState, action: Action): LogoutState => {
  switch (action.type) {
    case 'START_PREFLIGHT':
      return { ...state, preflight: true, loading: true };
    case 'PREFLIGHT_ERROR':
      return { ...state, preflight: true, loading: false, error: action.error };
    case 'COMPLETE_PREFLIGHT':
      return {
        ...state,
        loading: false,
        consent_required: action.consent_required,
        redirect_uri: action.redirect_uri,
      };
    case 'CONSENT_DENIED':
      return { ...state, denied: true };
    default:
      return state;
  }
};

interface IDPLogoutState {
  state: LogoutState;
  submit({ consent_granted }: { consent_granted: boolean }): Promise<void>;
}

export const useLogoutState = ({
  initialError,
  initialParams,
  oauthLogoutStart,
  revokeSession,
  onError,
}: {
  initialError: string | null;
  initialParams: OAuthLogoutParams;
  oauthLogoutStart(data: OAuthLogoutStartOptions): Promise<OAuthLogoutStartResponse>;
  revokeSession(): Promise<unknown>;
  onError(error: StytchSDKUIError): void;
}): IDPLogoutState => {
  const [state, dispatch] = useReducer(logoutStateReducer, initialState(initialError));

  useEffect(() => {
    if (!initialError) return;
    onError(new IDPOAuthFlowMissingParamError(initialError));
  }, [initialError, onError]);

  const submitInternal = useCallback(
    async (redirectURI: string) => {
      try {
        await revokeSession();
      } catch {
        // Session may already be revoked--in any event, we still want to
        // redirect the user
      }
      window.location.href = redirectURI;
    },
    [revokeSession],
  );

  const logoutPreflight = useCallback(async () => {
    dispatch({ type: 'START_PREFLIGHT' });

    let startResponse;
    try {
      startResponse = await oauthLogoutStart(initialParams);
    } catch (e: unknown) {
      const err = StytchAPIError.from(e);
      const message = err.error_message;
      dispatch({ type: 'PREFLIGHT_ERROR', error: message });
      onError(err);
      return;
    }

    if (startResponse.consent_required) {
      dispatch({
        type: 'COMPLETE_PREFLIGHT',
        consent_required: startResponse.consent_required,
        redirect_uri: startResponse.redirect_uri,
      });
      return;
    } else {
      submitInternal(startResponse.redirect_uri);
    }
  }, [initialParams, oauthLogoutStart, onError, submitInternal]);

  useEffect(() => {
    if (state.preflight) {
      return;
    }
    logoutPreflight();
  }, [logoutPreflight, state.preflight]);

  const submit = useCallback(
    async ({ consent_granted }: { consent_granted: boolean }) => {
      if (consent_granted) {
        return submitInternal(state.redirect_uri);
      } else {
        dispatch({ type: 'CONSENT_DENIED' });
      }
    },
    [submitInternal, state],
  );

  return { state, submit };
};

type Props = IDPLogoutState & {
  bootstrap: BootstrapData;
  bootstrapNotLoaded: boolean;
};
export const IDPLogout = ({ state, submit, bootstrap, bootstrapNotLoaded }: Props) => {
  const { t } = useLingui();
  const { loading, error, denied } = state;
  if (loading || bootstrapNotLoaded) {
    return <LoadingScreen />;
  }
  if (error) {
    return <ErrorDisplay text={error} />;
  }
  if (denied) {
    return (
      <Confirmation
        text={t({
          id: 'idpLogout.notLoggedOut',
          message: 'You have not been logged out. You may close this page.',
        })}
      />
    );
  }

  const projectName = bootstrap.projectName!;
  return (
    <Flex direction="column" gap={24}>
      <Text size="header" align="center">
        {t({
          id: 'idpLogout.title',
          message: 'Log out?',
        })}
      </Text>
      <div>
        {t({
          id: 'idpLogout.confirmMessage',
          message: `Are you sure you want to log out of your ${projectName} account?`,
        })}
      </div>
      <div>
        <Button type="button" onClick={() => submit({ consent_granted: true })}>
          {t({
            id: 'idpLogout.yes',
            message: 'Yes',
          })}
        </Button>
        <Button type="button" onClick={() => submit({ consent_granted: false })} variant="text">
          {t({
            id: 'idpLogout.no',
            message: 'No',
          })}
        </Button>
      </div>
    </Flex>
  );
};
