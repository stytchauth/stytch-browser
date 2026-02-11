import { useInternalStorage } from '../../../utils/useInternalStorage';
import { readB2BInternals } from '../../../utils/internal';
import { useStytch } from '../GlobalContextProvider';
import { safeLocalStorage, StorageKey } from '../../../utils/storage';

export const useLocalStorage = <T>(key: StorageKey, defaultValue: T) => {
  const stytch = useStytch();
  const { publicToken } = readB2BInternals(stytch);
  return useInternalStorage(safeLocalStorage, publicToken, key, defaultValue);
};
