import {
  AuthFlowType,
  B2BAuthenticateResponseWithMFA,
  B2BDiscoveryAuthenticateResponse,
  B2BMagicLinksDiscoveryAuthenticateResponse,
  B2BOrganizationsGetBySlugResponse,
  StytchAPIError,
  StytchError,
  StytchEvent,
  StytchEventType,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import { useEffect, useMemo, useState } from 'react';
import useSWRMutation, { MutationFetcher, SWRMutationConfiguration } from 'swr/mutation';

import { StytchB2BClient } from '../../b2b/StytchB2BClient';
import { StytchB2BExtendedLoginConfig } from '../../types';
import { readB2BInternals } from '../../utils/internal';
import { useConfig, useErrorCallback, useEventCallback, useGlobalReducer, useStytch } from './GlobalContextProvider';
import { Action } from './reducer';
import type { ProductId, StytchB2BProduct } from './StytchB2BProduct';
import { AppScreens } from './types/AppScreens';
import { ErrorType } from './types/ErrorType';

type RecursiveDotNotation<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends (...args: never[]) => unknown
          ? K
          : T[K] extends object
            ? `${K}.${RecursiveDotNotation<T[K]>}`
            : K
        : never;
    }[keyof T]
  : never;

type ValidStytchMutationKey = `stytch.${RecursiveDotNotation<StytchB2BClient>}`;

const KeyToStytchEventMap = {
  'stytch.magicLinks.authenticate': StytchEventType.B2BMagicLinkAuthenticate,
  'stytch.sso.authenticate': StytchEventType.B2BSSOAuthenticate,
  'stytch.sso.discoverConnections': StytchEventType.B2BSSODiscoverConnections,
  'stytch.magicLinks.discovery.authenticate': StytchEventType.B2BMagicLinkDiscoveryAuthenticate,
  'stytch.discovery.organizations.create': StytchEventType.B2BDiscoveryOrganizationsCreate,
  'stytch.discovery.intermediateSessions.exchange': StytchEventType.B2BDiscoveryIntermediateSessionExchange,
  'stytch.magicLinks.email.loginOrSignup': StytchEventType.B2BMagicLinkEmailLoginOrSignup,
  'stytch.magicLinks.email.discovery.send': StytchEventType.B2BMagicLinkEmailDiscoverySend,
  'stytch.oauth.authenticate': StytchEventType.B2BOAuthAuthenticate,
  'stytch.oauth.discovery.authenticate': StytchEventType.B2BOAuthDiscoveryAuthenticate,
  'stytch.otps.sms.send': StytchEventType.B2BSMSOTPSend,
  'stytch.otps.sms.authenticate': StytchEventType.B2BSMSOTPAuthenticate,
  'stytch.totp.create': StytchEventType.B2BTOTPCreate,
  'stytch.totp.authenticate': StytchEventType.B2BTOTPAuthenticate,
  'stytch.recoveryCodes.recover': StytchEventType.B2BRecoveryCodesRecover,
  'stytch.impersonation.authenticate': StytchEventType.B2BImpersonationAuthenticate,
  'stytch.otps.email.authenticate': StytchEventType.B2BOTPsEmailAuthenticate,
  'stytch.otps.email.discovery.authenticate': StytchEventType.B2BOTPsEmailDiscoveryAuthenticate,
  'stytch.otps.email.discovery.send': StytchEventType.B2BOTPsEmailDiscoverySend,
  'stytch.otps.email.loginOrSignup': StytchEventType.B2BOTPsEmailLoginOrSignup,
  'stytch.organization.getBySlug': StytchEventType.B2BOrganizationsGetBySlug,
} satisfies Partial<Record<ValidStytchMutationKey, StytchEventType>>;

type StytchExternalMutationKey = keyof typeof KeyToStytchEventMap;

type StytchInternalMutationKey = `internal.${string}`;

export type StytchMutationKey = StytchExternalMutationKey | StytchInternalMutationKey;

export function getStytchEventByKey(key: StytchMutationKey): StytchEventType | undefined {
  return KeyToStytchEventMap[key as StytchExternalMutationKey];
}

export const useMutate = <TData, TError, TKey extends StytchMutationKey, TExtraArg = never>(
  key: TKey,
  fetcher: MutationFetcher<TData, TExtraArg, TKey>,
  options: SWRMutationConfiguration<TData, TError, TExtraArg, TKey> = {},
) => {
  const onEvent = useEventCallback();
  const onError = useErrorCallback();

  const result = useSWRMutation<TData, TError, TKey, TExtraArg>(key, fetcher, {
    throwOnError: false,
    ...options,
    onSuccess: (data, key, config) => {
      const eventType = getStytchEventByKey(key as StytchMutationKey);
      if (eventType) {
        onEvent({ type: eventType, data } as StytchEvent<StytchProjectConfigurationInput>);
      }

      options.onSuccess?.(data, key, config);
    },
    onError: (error, key, config) => {
      onError(error as StytchError);

      options.onError?.(error, key, config);
    },
  });

  // Hide the error while mutating. This helps avoid the errors continuing to show after the user has clicked submit
  // and also ensures repeating errors causes <ErrorText> to re-render which is important for screenreaders to
  // re-announce them
  return result.isMutating ? { ...result, error: undefined } : result;
};

/**
 *
 * This hook triggers a request to retrieve the organization from the slug.
 * The hook only triggers the request if the SDK is being used in an organization flow,
 * and a slug pattern is present. The hook returns an isSearching boolean that can be used
 * to display a loading state while the search is in progress.
 */
export const useExtractSlug = () => {
  const [state, dispatch] = useGlobalReducer();
  const [pattern, setPattern] = useState<string | null | undefined>();
  const config = useConfig();

  const stytchClient = useStytch();
  const slug = config.organizationSlug ?? extractFromPattern(pattern || null, window.location.href);

  const { trigger, isMutating: isSearching } = useMutate<
    B2BOrganizationsGetBySlugResponse,
    StytchAPIError,
    StytchExternalMutationKey,
    { slug: string }
  >(
    'stytch.organization.getBySlug',
    (_: string, { arg: { slug } }: { arg: { slug: string } }) =>
      stytchClient.organization.getBySlug({ organization_slug: slug }),
    {
      onSuccess: ({ organization }) => {
        if (organization === null) {
          dispatch({
            type: 'set_error_message_and_transition',
            errorType: ErrorType.Organization,
            canGoBack: false,
          });
        } else {
          dispatch({
            type: 'set_organization',
            organization: {
              ...organization,
            },
          });
        }
      },
    },
  );

  useEffect(() => {
    readB2BInternals(stytchClient)
      .bootstrap.getAsync()
      .then(({ slugPattern }) => {
        setPattern(slugPattern);
      });
  }, [stytchClient]);

  useEffect(() => {
    if (
      slug !== null &&
      state.flowState.organization === null &&
      state.screen === AppScreens.Main &&
      state.flowState.type == AuthFlowType.Organization
    ) {
      trigger({ slug });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- SDK-1354
  }, [slug, state.flowState, state.screen]);

  // The org is pending identification if the slug pattern has not yet been
  // determined (i.e., `undefined`) or the organization request is in progress
  const resultPending = pattern === undefined || isSearching;

  return { slug, resultPending };
};

export const useBootstrap = () => {
  const stytchClient = useStytch();
  const [bootstrap, setBootstrap] = useState(readB2BInternals(stytchClient).bootstrap.getSync());

  useEffect(() => {
    readB2BInternals(stytchClient)
      .bootstrap.getAsync()
      .then((data) => {
        setBootstrap(data);
      });
  }, [stytchClient]);

  return bootstrap;
};

export const onAuthenticateSuccess = (
  data: B2BAuthenticateResponseWithMFA<StytchProjectConfigurationInput>,
  dispatch: React.Dispatch<Action>,
  config: StytchB2BExtendedLoginConfig,
) => {
  dispatch({
    type: 'primary_authenticate_success',
    response: data,
    includedMfaMethods: config.mfaProductInclude,
  });
};

export const onDiscoveryAuthenticateSuccess = (
  data: B2BDiscoveryAuthenticateResponse | B2BMagicLinksDiscoveryAuthenticateResponse,
  dispatch: React.Dispatch<Action>,
) => {
  dispatch({
    type: 'set_discovery_state',
    email: data.email_address,
    discoveredOrganizations: data.discovered_organizations,
  });
};

export const extractFromPattern = (pattern: string | null, href: string): string | null => {
  if (pattern === null) return null;

  const url = new URL(href);
  url.search = '';

  const currentUrl = url.toString().trim();
  const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '(?:[^.]+)').replace('{{slug}}', '(.+)');

  const regex = new RegExp(regexPattern);
  const match = currentUrl.match(regex);

  if (match && match[1]) {
    return match?.[1];
  }

  return null;
};

export function hasProduct(products: StytchB2BProduct[], product: ProductId) {
  return products.some((p) => p.id === product);
}

export function useProductComponents<Type extends 'screens' | 'mainScreen' | 'ssoAndOAuthButtons'>(
  { products, organizationProducts }: { products: StytchB2BProduct[]; organizationProducts: StytchB2BProduct[] },
  screenType: Type,
) {
  return useMemo(() => {
    const map = {} as Required<StytchB2BProduct[Type]>;
    for (const product of [...products, ...organizationProducts]) {
      if (product[screenType]) Object.assign(map, product[screenType]);
    }
    return map;
  }, [products, organizationProducts, screenType]);
}
