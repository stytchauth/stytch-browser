import { StytchEventType } from '@stytch/core/public';
import { useConfig, useEventCallback, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useDiscoveryOrganizationsCreate = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const discoveryOrganizationsCreate = async () => {
    dispatch({ type: 'discovery/organizations/create' });
    try {
      const response = await stytchClient.discovery.organizations.create({
        session_duration_minutes: config.productConfig.sessionOptions.sessionDurationMinutes,
      });
      onEvent({ type: StytchEventType.B2BDiscoveryOrganizationsCreate, data: response });
      dispatch({ type: 'discovery/organizations/create/success', response: response });
      dispatch({
        type: 'mfa/primaryAuthenticate/success',
        response: response,
        includedMfaMethods: config.productConfig.mfaProductInclude,
      });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'discovery/organizations/create/error', error: errorResponse });
    }
  };
  return { discoveryOrganizationsCreate };
};
