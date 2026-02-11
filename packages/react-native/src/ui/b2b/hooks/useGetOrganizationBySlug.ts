import { useEffect, useState } from 'react';
import { StytchEventType } from '@stytch/core/public';
import { useEventCallback, useConfig, useGlobalReducer, useStytch } from '../ContextProvider';
import { Screen } from '../screens';
import { AuthFlowType } from '@stytch/core/public';
import { createErrorResponseFromError } from '../utils';
import { B2BErrorType } from '../../shared/types';

export const useGetOrganizationBySlug = () => {
  const stytchClient = useStytch();
  const getOrganizationBySlug = async (slug: string) =>
    stytchClient.organization.getBySlug({ organization_slug: slug });
  return { getOrganizationBySlug };
};

export const useGetOrganizationBySlugOnLoad = () => {
  const [state, dispatch] = useGlobalReducer();
  const config = useConfig();
  const stytchClient = useStytch();
  const { getOrganizationBySlug } = useGetOrganizationBySlug();
  const onEvent = useEventCallback();
  const [isSearching, setIsSearching] = useState(false);
  const slug = config.organizationSlug;

  useEffect(() => {
    if (
      slug !== null &&
      state.authenticationState.organization === null &&
      state.screen === Screen.Main &&
      state.authenticationState.authFlowType == AuthFlowType.Organization
    ) {
      setIsSearching(true);
      getOrganizationBySlug(slug)
        .then((response) => {
          onEvent({ type: StytchEventType.B2BOrganizationsGetBySlug, data: response });
          if (response.organization === null) {
            dispatch({
              type: 'navigate/to',
              screen: Screen.Error,
              error: { internalError: B2BErrorType.Organization },
            });
          } else {
            dispatch({ type: 'organization/getBySlug/success', response: response });
          }
        })
        .catch((e) => {
          const errorResponse = createErrorResponseFromError(e);
          dispatch({ type: 'organization/getBySlug/error', error: errorResponse });
        })
        .finally(() => setIsSearching(false));
    }
  }, [
    slug,
    state.authenticationState.organization,
    state.screen,
    state.authenticationState.authFlowType,
    stytchClient.organization,
    dispatch,
    getOrganizationBySlug,
    onEvent,
  ]);

  return { isSearching, slug };
};
