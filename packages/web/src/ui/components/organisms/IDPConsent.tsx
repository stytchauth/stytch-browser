import { useLingui } from '@lingui/react/macro';
import { BootstrapData, logger } from '@stytch/core';
import {
  ConnectedAppPublic,
  IDPOAuthFlowMissingParamError,
  OAuthAuthorizeSubmitOptions,
  ScopeResult,
  StytchAPIError,
  StytchEvent,
  StytchEventType,
  StytchSDKUIError,
} from '@stytch/core/public';
import React, { PropsWithChildren, useCallback, useEffect, useMemo, useReducer } from 'react';

import {
  containsCustomScopes,
  createCustomScopeDescriptions,
  fallbackConsentManifestGenerator,
  OAuthAuthorizeParams,
} from '../../../utils/idpHelpers';
import Button from '../atoms/Button';
import Column from '../atoms/Column';
import Logo from '../atoms/Logo';
import Typography from '../atoms/Typography';
import ButtonColumn from '../molecules/ButtonColumn';
import { Confirmation } from '../molecules/Confirmation';
import { ErrorDisplay } from '../molecules/ErrorScreen';
import { LoadingScreen } from '../molecules/Loading';
import { usePresentation } from '../PresentationConfig';
import { ConsentManifest, UngrantableScopes } from './IDPConsentManifest';
import { useConsentManifestGenerator } from './IDPContextProvider';

type Action =
  | { type: 'START_SUBMIT' }
  | { type: 'COMPLETE_SUBMIT' }
  | { type: 'START_PREFLIGHT' }
  | { type: 'PREFLIGHT_ERROR'; error: string }
  | {
      type: 'COMPLETE_PREFLIGHT';
      consent_required: boolean;
      client: ConnectedAppPublic;
      grantable_scope: string;
      ungrantable_scope: string;
    }
  | { type: 'CONSENT_DENIED' };

type IDPState = {
  // True if there is a request in progress
  loading: boolean;
  // True if we have kicked off the preflight request
  preflight: boolean;
  error: string | null;
  // True after we have submitted the form. This causes a browser redirect
  // but there is a small period before the redirect loads where we can still
  // show some limited UI
  success: boolean;
  // True if the user has denied consent
  denied: boolean;
  // Preflight results: Do we need to ask for consent? Who is asking?
  consent_required: boolean;
  client: ConnectedAppPublic | null;
  grantable_scope: string;
  ungrantable_scope: string;
  // Used as a backup client name.
  // The redirect URI's domain is parsed out to populate a missing client name
  // in the IDPConsent component.
  redirect_uri: string;
};

const initialState = (error: string | null, params: OAuthAuthorizeParams): IDPState => ({
  loading: !error,
  preflight: !!error,
  error: error,
  success: false,
  denied: false,
  consent_required: false,
  client: null,
  grantable_scope: '',
  ungrantable_scope: '',
  redirect_uri: params.redirect_uri,
});

const idpStateReducer = (state: IDPState, action: Action): IDPState => {
  switch (action.type) {
    case 'START_SUBMIT':
      return { ...state, loading: true };
    case 'COMPLETE_SUBMIT':
      return { ...state, loading: false, success: true };
    case 'START_PREFLIGHT':
      return { ...state, preflight: true, loading: true };
    case 'PREFLIGHT_ERROR':
      return { ...state, preflight: true, loading: false, error: action.error };
    case 'COMPLETE_PREFLIGHT':
      return {
        ...state,
        loading: false,
        client: action.client,
        consent_required: action.consent_required,
        grantable_scope: action.grantable_scope,
        ungrantable_scope: action.ungrantable_scope,
      };
    case 'CONSENT_DENIED':
      return { ...state, denied: true };
    default:
      return state;
  }
};

interface IDPConsentState {
  state: IDPState;
  submit({ consent_granted }: { consent_granted: boolean }): Promise<void>;
}

export const useIDPState = ({
  initialError,
  initialParams,
  oauthAuthorizeStart,
  oauthAuthorizeSubmit,
  onError,
  onEvent,
}: {
  initialError: string | null;
  initialParams: OAuthAuthorizeParams;
  oauthAuthorizeStart(data: {
    client_id: string;
    redirect_uri: string;
    response_type: string;
    scopes: string[];
    prompt?: string;
  }): Promise<{ consent_required: boolean; client: ConnectedAppPublic; scope_results: ScopeResult[] }>;
  oauthAuthorizeSubmit(
    data: OAuthAuthorizeSubmitOptions,
  ): Promise<{ redirect_uri: string; authorization_code?: string }>;
  onError(error: StytchSDKUIError): void;
  onEvent(event: StytchEvent): void;
}): IDPConsentState => {
  const [state, dispatch] = useReducer(idpStateReducer, initialState(initialError, initialParams));

  useEffect(() => {
    if (!initialError) return;
    onError(new IDPOAuthFlowMissingParamError(initialError));
  }, [initialError, onError]);

  const submitInternal = useCallback(
    async ({ consent_required, consent_granted }: { consent_required: boolean; consent_granted: boolean }) => {
      dispatch({ type: 'START_SUBMIT' });
      const submitResp = await oauthAuthorizeSubmit({
        ...initialParams,
        consent_granted,
      });

      if (submitResp.authorization_code) {
        dispatch({ type: 'COMPLETE_SUBMIT' });
      }

      window.location.href = submitResp.redirect_uri;
      if (consent_required && !consent_granted) {
        dispatch({ type: 'CONSENT_DENIED' });
        onEvent({
          type: StytchEventType.OAuthAuthorizeFlowConsentDenied,
          data: {},
        });
      } else {
        onEvent({
          type: StytchEventType.OAuthAuthorizeFlowComplete,
          data: {},
        });
      }
    },
    [oauthAuthorizeSubmit, initialParams, onEvent],
  );

  const submit = useCallback(
    ({ consent_granted }: { consent_granted: boolean }) =>
      submitInternal({
        consent_granted,
        consent_required: true,
      }),
    [submitInternal],
  );

  const loadClient = useCallback(async () => {
    dispatch({ type: 'START_PREFLIGHT' });
    onEvent({
      type: StytchEventType.OAuthAuthorizeFlowStart,
      data: {
        client_id: initialParams['client_id'],
        redirect_uri: initialParams['redirect_uri'],
        scope: initialParams['scopes'].join(' '),
      },
    });

    let startResponse;
    try {
      startResponse = await oauthAuthorizeStart(initialParams);
    } catch (e: unknown) {
      const err = StytchAPIError.from(e);
      const message = err.error_message;
      dispatch({ type: 'PREFLIGHT_ERROR', error: message });
      onError(err);
      return;
    }

    if (startResponse.consent_required) {
      const grantable = startResponse.scope_results
        .filter((s) => s.is_grantable)
        .map((s) => s.scope)
        .join(' ');
      const ungrantable = startResponse.scope_results
        .filter((s) => !s.is_grantable)
        .map((s) => s.scope)
        .join(' ');
      dispatch({
        type: 'COMPLETE_PREFLIGHT',
        consent_required: startResponse.consent_required,
        client: startResponse.client,
        grantable_scope: grantable,
        ungrantable_scope: ungrantable,
      });
      return;
    } else {
      await submitInternal({ consent_required: false, consent_granted: false });
    }
  }, [onEvent, initialParams, oauthAuthorizeStart, onError, submitInternal]);

  useEffect(() => {
    if (state.preflight) {
      return;
    }
    loadClient();
  }, [loadClient, state.preflight]);
  return { state, submit };
};

type Props = IDPConsentState & {
  bootstrap: BootstrapData;
  bootstrapNotLoaded: boolean;
};
export const IDPConsent: React.FC<Props> = ({ bootstrap, bootstrapNotLoaded, state, submit }) => {
  const { t } = useLingui();
  const { loading, error, denied, success, client } = state;
  const customConsentManifestGenerator = useConsentManifestGenerator();

  const clientName = useMemo(() => {
    let name = state.client?.client_name ?? '';
    // If a client name isn't provided then try and parse it from the
    // redirect URI domain.
    if (!name) {
      try {
        const u = new URL(state.redirect_uri);
        name = u.hostname;
      } catch (e) {
        logger.warn('Unable to parse host from redirect URI.', e);
        name = t({ id: 'idpConsent.defaultClientName', message: 'The App' });
      }
    }
    return name;
  }, [state.client?.client_name, state.redirect_uri, t]);

  const manifest = useMemo(() => {
    if (customConsentManifestGenerator) {
      try {
        return customConsentManifestGenerator({
          scopes: state.grantable_scope.split(' '),
          clientName,
        });
      } catch (e) {
        logger.error('Error rendering custom consent screen. Falling back to default consent screen.', e);
      }
    }

    return fallbackConsentManifestGenerator({
      scopes: state.grantable_scope.split(' '),
      rbacPolicy: bootstrap.rbacPolicy,
      clientName,
    });
  }, [customConsentManifestGenerator, state.grantable_scope, clientName, bootstrap.rbacPolicy]);

  const ungrantableScopeDescriptions = useMemo(() => {
    if (state.ungrantable_scope === '') return [];
    return createCustomScopeDescriptions(state.ungrantable_scope.split(' '), bootstrap.rbacPolicy);
  }, [state.ungrantable_scope, bootstrap.rbacPolicy]);

  if (loading || bootstrapNotLoaded) {
    return <LoadingScreen />;
  }
  if (error) {
    return <ErrorDisplay text={error} />;
  }
  if (denied) {
    return <ErrorDisplay text={t({ id: 'idpConsent.denied', message: 'Access to the application was denied.' })} />;
  }
  if (success) {
    return <Confirmation />;
  }
  return (
    <Consent
      client={client!}
      submit={submit}
      grantableScope={state.grantable_scope}
      projectName={bootstrap.projectName!}
    >
      <UngrantableScopes ungrantableScopeDescriptions={ungrantableScopeDescriptions} clientName={clientName} />
      <ConsentManifest manifest={manifest} clientName={clientName} />
    </Consent>
  );
};

type ConsentProps = {
  client: ConnectedAppPublic;
  submit: (x: { consent_granted: boolean }) => Promise<void>;
  grantableScope: string;
  projectName: string;
};

const Consent: React.FC<PropsWithChildren<ConsentProps>> = ({
  client,
  submit,
  grantableScope,
  projectName,
  children,
}) => {
  const { t } = useLingui();
  const { options } = usePresentation();
  const clientName = client.client_name;
  const title = containsCustomScopes(grantableScope)
    ? t({
        id: 'idpConsent.customScopes.title',
        message: `${clientName} wants to access your ${projectName} account`,
      })
    : t({
        id: 'idpConsent.signIn.title',
        message: `Sign in to ${clientName} with ${projectName}`,
      });

  return (
    <Column gap={6}>
      {options.logo && <Logo appLogo={options.logo} />}
      <Typography variant="header" align="center">
        {title}
      </Typography>

      {children}

      <ButtonColumn>
        <Button variant="primary" onClick={() => submit({ consent_granted: true })}>
          {t({
            id: 'idpConsent.button.allow',
            message: 'Allow',
          })}
        </Button>
        <Button onClick={() => submit({ consent_granted: false })} variant="ghost">
          {t({
            id: 'idpConsent.button.deny',
            message: 'Deny',
          })}
        </Button>
      </ButtonColumn>
    </Column>
  );
};
