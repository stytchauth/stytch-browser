import {
  CLIENTSIDE_SERVICES_IFRAME_URL,
  getDFPBackendURL,
  getDFPCdnURL,
  getFREDomainURL,
  getLiveApiURL,
  getTestApiURL,
  InternalStytchClientOptions,
  isTestPublicToken,
  validateInDev,
} from '@stytch/core';
import { StytchClientOptions } from '@stytch/core/public';

export const buildFinalConfig = (clientName: string, opts: InternalStytchClientOptions = {}) => {
  const { cookieOptions, keepSessionAlive } = opts;

  validateInDev(clientName, opts, {
    keepSessionAlive: 'optionalBoolean',
  });

  if (cookieOptions) {
    validateInDev(`${clientName}.cookieOptions`, cookieOptions, {
      opaqueTokenCookieName: 'optionalString',
      jwtCookieName: 'optionalString',
      istCookieName: 'optionalString',
      path: 'optionalString',
      domain: 'optionalString',
      usesHttpOnlyCookies: 'optionalBoolean',
    });
  }

  return {
    cookieOptions,
    keepSessionAlive,
    endpoints: {
      testAPIURL: getTestApiURL(opts),
      liveAPIURL: getLiveApiURL(opts),
      dfpBackendURL: getDFPBackendURL(opts),
      dfpCdnURL: getDFPCdnURL(opts),
      freDomainURL: getFREDomainURL(opts),
      clientsideServicesIframeURL: opts?.endpoints?.clientsideServicesIframeURL ?? CLIENTSIDE_SERVICES_IFRAME_URL,
    },
  };
};

/**
 * rawOptions should be the original object passed into the client, not the output from buildFinalConfig
 */
export const hasCustomApiEndpoint = (token: string, rawOptions: StytchClientOptions = {}) => {
  // endpointOptions is deprecated, but we still need to account for it
  const { customBaseUrl, endpointOptions } = rawOptions;
  return isTestPublicToken(token)
    ? !!(customBaseUrl || endpointOptions?.testApiDomain)
    : !!(customBaseUrl || endpointOptions?.apiDomain);
};

/**
 * With a custom API endpoint the session may be held in HttpOnly cookies, which the SDK cannot detect,
 * unless cookieOptions.usesHttpOnlyCookies is explicitly false.
 * rawOptions should be the original object passed into the client.
 */
export const mayHaveHttpOnlySessionCookies = (token: string, rawOptions: StytchClientOptions = {}) =>
  hasCustomApiEndpoint(token, rawOptions) && rawOptions.cookieOptions?.usesHttpOnlyCookies !== false;
