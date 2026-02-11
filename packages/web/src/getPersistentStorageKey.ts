const PERSISTENT_STORAGE_KEY_PREFIX = 'stytch_sdk_state_';

export const getPersistentStorageKey = (publicToken: string, key = ''): string => {
  return `${PERSISTENT_STORAGE_KEY_PREFIX}${publicToken}${key ? `::${key}` : ''}`;
};
