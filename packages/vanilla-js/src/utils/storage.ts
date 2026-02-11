const PERSISTENT_STORAGE_KEY_PREFIX = 'stytch_sdk_state_';

// Declare all keys to use with storage here. These storage are global so re-using the same key will cause collision
// Do not remove values from here when the caller is removed since these will still be persisted on user's browsers.
export type StorageKey =
  // SubscriptionService
  | ''
  | 'seen_domains'
  // Bootstrap
  | 'bootstrap'
  // PKCE manager
  | `PKCE_VERIFIER:${string}`
  // Admin portal
  | `${string}_itemsPerPage`
  | `${string}_filter_${string}`
  // B2B
  | 'reset-email-value'
  | `b2b_last_used_method`
  // B2C
  | `b2c_last_used_oauth`;

export const getPersistentStorageKey = (publicToken: string, key: StorageKey): string => {
  return `${PERSISTENT_STORAGE_KEY_PREFIX}${publicToken}${key ? `::${key}` : ''}`;
};

export interface IStorage {
  getItem(publicKey: string, key: StorageKey): string | null;
  removeItem(publicKey: string, key: StorageKey): void;
  setItem(publicKey: string, key: StorageKey, value: string): void;
}

export interface IKeyBoundStorage {
  getItem(key: StorageKey): string | null;
  setItem(key: StorageKey, value: string): void;
  removeItem(key: StorageKey): void;
}

function makeSafeStorage(storage: Storage | undefined): IStorage {
  if (storage == null) {
    return {
      getItem() {
        return null;
      },
      removeItem() {
        // Noop
      },
      setItem() {
        // Noop
      },
    };
  }

  return {
    getItem(publicKey: string, key: StorageKey): string | null {
      const persistentStorageKey = getPersistentStorageKey(publicKey, key);
      try {
        return storage.getItem(persistentStorageKey);
      } catch {
        // Swallow error
        return null;
      }
    },
    setItem(publicKey: string, key: StorageKey, value: string): void {
      const persistentStorageKey = getPersistentStorageKey(publicKey, key);
      try {
        if (value) storage.setItem(persistentStorageKey, value);
      } catch {
        // Swallow error
      }
    },
    removeItem(publicKey: string, key: StorageKey): void {
      const persistentStorageKey = getPersistentStorageKey(publicKey, key);
      try {
        storage.removeItem(persistentStorageKey);
      } catch {
        // Swallow error
      }
    },
  };
}

export const safeLocalStorage = makeSafeStorage(globalThis.localStorage);
export const safeSessionStorage = makeSafeStorage(globalThis.sessionStorage);

export function getKeyBoundStorage(storage: IStorage, publicToken: string): IKeyBoundStorage {
  return {
    getItem(key: StorageKey) {
      return storage.getItem(publicToken, key);
    },
    setItem(key: StorageKey, value: string): void {
      storage.setItem(publicToken, key, value);
    },
    removeItem(key: StorageKey) {
      storage.removeItem(publicToken, key);
    },
  };
}
