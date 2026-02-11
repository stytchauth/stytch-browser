import {
  CLIENTSIDE_SERVICES_IFRAME_URL,
  InternalStytchClientOptions,
  getDFPBackendURL,
  getDFPCdnURL,
  getLiveApiURL,
  getTestApiURL,
  validate,
  isTestPublicToken,
} from '@stytch/core';
import { StytchClientOptions } from '@stytch/core/public';

export const buildFinalConfig = (clientName: string, opts: InternalStytchClientOptions = {}) => {
  const { cookieOptions, keepSessionAlive } = opts;
  const validator = validate(clientName);

  validator.isOptionalBoolean('keepSessionAlive', keepSessionAlive);

  if (cookieOptions) {
    validator
      .isOptionalString('cookieOptions.opaqueTokenCookieName', cookieOptions.opaqueTokenCookieName)
      .isOptionalString('cookieOptions.jwtCookieName', cookieOptions.jwtCookieName)
      .isOptionalString('cookieOptions.istCookieName', cookieOptions.istCookieName)
      .isOptionalString('cookieOptions.path', cookieOptions.path)
      .isOptionalString('cookieOptions.domain', cookieOptions.domain);
  }

  return {
    cookieOptions,
    keepSessionAlive,
    endpoints: {
      testAPIURL: getTestApiURL(opts),
      liveAPIURL: getLiveApiURL(opts),
      dfpBackendURL: getDFPBackendURL(opts),
      dfpCdnURL: getDFPCdnURL(opts),
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
