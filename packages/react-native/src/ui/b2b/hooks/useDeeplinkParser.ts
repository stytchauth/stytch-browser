import 'react-native-url-polyfill/auto';

import { useGlobalReducer } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';
import { useEventLogger } from './useEventLogger';
import { useMagicLinksAuthenticate } from './useMagicLinksAuthenticate';
import { useMagicLinksDiscoveryAuthenticate } from './useMagicLinksDiscoveryAuthenticate';
import { useOauthAuthenticate } from './useOauthAuthenticate';
import { useOauthDiscoveryAuthenticate } from './useOauthDiscoveryAuthenticate';
import { useSSOAuthenticate } from './useSSOAuthenticate';

export const useDeeplinkParser = () => {
  const { logEvent } = useEventLogger();
  const { magicLinksAuthenticate } = useMagicLinksAuthenticate();
  const { oauthDiscoveryAuthenticate } = useOauthDiscoveryAuthenticate();
  const { magicLinksDiscoveryAuthenticate } = useMagicLinksDiscoveryAuthenticate();
  const { ssoAuthenticate } = useSSOAuthenticate();
  const { oauthAuthenticate } = useOauthAuthenticate();
  const [state, dispatch] = useGlobalReducer();

  const parseDeeplink = async (deeplink: string) => {
    const { isParsingDeeplink, deeplinksHandled } = state.deeplinkState;
    const hasHandledDeeplink = deeplinksHandled.includes(deeplink);
    if (isParsingDeeplink || hasHandledDeeplink) return;
    dispatch({ type: 'deeplink/parse', url: deeplink });
    try {
      const url = new URL(deeplink);
      const tokenType = url.searchParams.get('stytch_token_type');
      const token = url.searchParams.get('token');
      const redirectType = url.searchParams.get('stytch_redirect_type');
      if (!token) throw new Error('No token found');
      switch (tokenType) {
        case 'discovery':
          if (redirectType === 'reset_password') {
            dispatch({ type: 'passwords/resetPassword', token: token, tokenType: tokenType });
          } else {
            await magicLinksDiscoveryAuthenticate(token);
          }
          break;
        case 'discovery_oauth':
          await oauthDiscoveryAuthenticate(token);
          break;
        case 'sso':
          await ssoAuthenticate(token);
          break;
        case 'multi_tenant_magic_links':
          await magicLinksAuthenticate(token);
          break;
        case 'oauth':
          await oauthAuthenticate(token);
          break;
        case 'multi_tenant_passwords':
          dispatch({ type: 'passwords/resetPassword', token: token, tokenType: tokenType });
          return;
        default:
          dispatch({ type: 'deeplink/parse/ignored' });
          return;
      }
      dispatch({ type: 'deeplink/parse/success' });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      logEvent({
        name: 'deeplink_handled_failure',
        details: { error: errorResponse?.apiError ?? errorResponse?.sdkError },
      });
      dispatch({ type: 'deeplink/parse/error', error: errorResponse ?? { internalError: 'Unable to parse deeplink' } });
    }
  };
  return { parseDeeplink };
};
