import { getDFPBackendURL, getLiveApiURL, getTestApiURL, validateInDev } from '@stytch/core';

import { StytchClientOptions } from '../StytchClientOptions';

export function buildFinalConfig(clientName: string, maybeConfig: StytchClientOptions = {}) {
  const config = typeof maybeConfig === 'boolean' ? { iosDisableUrlCache: maybeConfig } : maybeConfig;
  const { keepSessionAlive, iosDisableUrlCache } = config;

  validateInDev(clientName, config, {
    keepSessionAlive: 'optionalBoolean',
    iosDisableUrlCache: 'optionalBoolean',
  });

  return {
    keepSessionAlive,
    iosDisableUrlCache,

    endpoints: {
      testAPIURL: getTestApiURL(config),
      liveAPIURL: getLiveApiURL(config),
      dfpBackendURL: getDFPBackendURL(config),
    },
  };
}
