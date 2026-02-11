import { useStytchClient } from './useStytchClient';
import { readB2BInternals } from '../../utils/internal';
import { useInternalStorage } from '../../utils/useInternalStorage';
import { safeLocalStorage, StorageKey } from '../../utils/storage';

export const useLocalStorage = <T>(key: StorageKey, defaultValue: T) => {
  const stytch = useStytchClient();
  const { publicToken } = readB2BInternals(stytch);
  return useInternalStorage(safeLocalStorage, publicToken, key, defaultValue);
};
