const envKeys = {
  stytchPublicToken: 'STYTCH_PUBLIC_TOKEN',
  testAPIURL: 'TEST_API_URL',
  liveAPIURL: 'LIVE_API_URL',
  dfpBackendURL: 'DFP_BACKEND_URL',
  dfpCdnDomain: 'DFP_CDN_DOMAIN',
  clientsideServicesIframeURL: 'CLIENTSIDE_SERVICES_IFRAME_URL',
};

const getLocalStorageFullKey = (localStorageKey) => `b2cdemo::config::${localStorageKey}`;

export const getLocalStorageConfigItem = (localStorageKey) => {
  return localStorage.getItem(getLocalStorageFullKey(localStorageKey));
};

const getEnvFullKey = (envKey) => `REACT_APP_${envKey}`;
const getEnvKey = (key) => envKeys[key];

export const getEnvConfigItem = (key) => {
  return import.meta.env[getEnvFullKey(getEnvKey(key))];
};

const getConfigItem = (localStorageKey) => {
  const localStorageValue = getLocalStorageConfigItem(localStorageKey);
  if (localStorageValue) {
    return { value: localStorageValue, source: 'localStorage', key: getLocalStorageFullKey(localStorageKey) };
  }

  const envKey = getEnvKey(localStorageKey);
  return { value: getEnvConfigItem(localStorageKey), source: 'env', key: getEnvFullKey(envKey) };
};

export const setConfigItem = (localStorageKey, value) => {
  if (value) {
    localStorage.setItem(getLocalStorageFullKey(localStorageKey), value);
  } else {
    localStorage.removeItem(getLocalStorageFullKey(localStorageKey));
  }
};

export const setConfigItems = (items) => {
  Object.entries(items).forEach(([key, value]) => {
    setConfigItem(key, value);
  });
};

const getConfiguration = () => {
  return Object.fromEntries(Object.keys(envKeys).map((key) => [key, getConfigItem(key)]));
};

export const configuration = getConfiguration();
