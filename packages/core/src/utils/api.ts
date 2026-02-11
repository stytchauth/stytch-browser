import { LIVE_API_URL, TEST_API_URL } from '../constants';
import { InternalStytchClientOptions } from '../types';
import { getHttpsUrl } from './getHttpsUrl';
import { logger } from './logger';

export const getLiveApiURL = (opts: InternalStytchClientOptions | undefined) => {
  const domain = opts?.customBaseUrl ?? opts?.endpointOptions?.apiDomain;
  if (domain) {
    const httpsUrl = getHttpsUrl(domain);
    if (httpsUrl) {
      return httpsUrl;
    } else {
      const key = opts?.customBaseUrl ? 'customBaseUrl' : 'apiDomain';
      logger.warn(`Unable to use custom API domain \`${domain}\`. ${key} should be a valid domain.`);
    }
  }

  return opts?.endpoints?.liveAPIURL ?? LIVE_API_URL;
};

export const getTestApiURL = (opts: InternalStytchClientOptions | undefined) => {
  const domain = opts?.customBaseUrl ?? opts?.endpointOptions?.testApiDomain;
  if (domain) {
    const httpsUrl = getHttpsUrl(domain);
    if (httpsUrl) {
      return httpsUrl;
    } else {
      const key = opts?.customBaseUrl ? 'customBaseUrl' : 'testApiDomain';
      logger.warn(`Unable to use custom API domain \`${domain}\`. ${key} should be a valid domain.`);
    }
  }

  return opts?.endpoints?.testAPIURL ?? TEST_API_URL;
};
