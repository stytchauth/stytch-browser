import { STYTCH_DFP_BACKEND_URL, STYTCH_DFP_CDN_URL } from '../constants';
import { InternalStytchClientOptions } from '../types';
import { getHttpsUrl } from './getHttpsUrl';
import { logger } from './logger';

export const getDFPBackendURL = (opts: InternalStytchClientOptions | undefined) => {
  const domain = opts?.dfppaUrl ?? opts?.endpointOptions?.dfppaDomain;
  if (domain) {
    const httpsUrl = getHttpsUrl(domain);
    if (httpsUrl) {
      return httpsUrl;
    } else {
      const key = opts?.dfppaUrl ? 'dfppaUrl' : 'dfppaDomain';
      logger.warn(`Unable to use custom DFPPA domain \`${domain}\`. ${key} should be a valid domain.`);
    }
  }

  return opts?.endpoints?.dfpBackendURL ?? STYTCH_DFP_BACKEND_URL;
};

export const getFREDomainURL = (opts: InternalStytchClientOptions | undefined) => {
  const domain = opts?.freDomain;
  if (!domain) {
    return undefined;
  }

  const httpsUrl = getHttpsUrl(domain);
  if (!httpsUrl) {
    logger.warn(`Unable to use custom FRE domain \`${domain}\`. freDomain should be a valid domain.`);
  }
  return httpsUrl;
};

export const getDFPCdnURL = (opts: InternalStytchClientOptions | undefined) => {
  const domain = opts?.dfpCdnUrl ?? opts?.endpointOptions?.dfpCdnDomain;
  if (domain) {
    const httpsUrl = getHttpsUrl(domain);
    if (httpsUrl) {
      return httpsUrl;
    } else {
      const key = opts?.dfpCdnUrl ? 'dfpCdnUrl' : 'dfpCdnDomain';
      logger.warn(`Unable to use custom DFP CDN domain \`${domain}\`. ${key} should be a valid domain.`);
    }
  }

  return STYTCH_DFP_CDN_URL;
};
