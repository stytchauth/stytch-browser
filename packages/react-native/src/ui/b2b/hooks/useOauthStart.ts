import { B2BOAuthProviders } from '@stytch/core/public';
import { useGlobalReducer, useRedirectUrl, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export type OauthStartProps = {
  providerType: B2BOAuthProviders;
  loginRedirectUrl?: string;
  signupRedirectUrl?: string;
  discoveryRedirectUrl?: string;
  customScopes?: string[];
  providerParams?: Record<string, string>;
};

export const useOauthStart = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const redirectUrl = useRedirectUrl();
  const oauthStart = async (props: OauthStartProps) => {
    dispatch({ type: 'oauth/start' });
    try {
      if (state.authenticationState.organization) {
        await stytchClient.oauth[props.providerType].start({
          login_redirect_url: redirectUrl,
          signup_redirect_url: redirectUrl,
          custom_scopes: props.customScopes,
          organization_id: state.authenticationState.organization.organization_id,
          provider_params: props.providerParams,
        });
      } else {
        await stytchClient.oauth[props.providerType].discovery.start({
          discovery_redirect_url: redirectUrl,
          custom_scopes: props.customScopes,
          provider_params: props.providerParams,
        });
      }
      dispatch({ type: 'oauth/start/success' });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'oauth/start/error', error: errorResponse });
    }
  };
  return { oauthStart };
};
