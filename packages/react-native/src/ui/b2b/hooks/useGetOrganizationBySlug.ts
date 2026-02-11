import { AuthFlowType, StytchEventType } from '@stytch/core/public';
import { useEffect, useState } from 'react';

import { B2BErrorType } from '../../shared/types';
import { useConfig, useEventCallback, useGlobalReducer, useStytch } from '../ContextProvider';
import { Screen } from '../screens';
import { createErrorResponseFromError } from '../utils';

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
