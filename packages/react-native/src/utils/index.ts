import { getDFPBackendURL, getLiveApiURL, getTestApiURL, validate } from '@stytch/core';
import { StytchClientOptions } from '../StytchClientOptions';

export function buildFinalConfig(clientName: string, maybeConfig: StytchClientOptions = {}) {
  const validator = validate(clientName);

  const config = typeof maybeConfig === 'boolean' ? { iosDisableUrlCache: maybeConfig } : maybeConfig;
  const { keepSessionAlive, iosDisableUrlCache } = config;

  validator
    .isOptionalBoolean('keepSessionAlive', keepSessionAlive)
    .isOptionalBoolean('iosDisableUrlCache', iosDisableUrlCache);

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
