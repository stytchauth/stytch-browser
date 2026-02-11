import { readB2BInternals } from '../../../utils/internal';
import { safeLocalStorage, StorageKey } from '../../../utils/storage';
import { useInternalStorage } from '../../../utils/useInternalStorage';
import { useStytch } from '../GlobalContextProvider';

export const useLocalStorage = <T>(key: StorageKey, defaultValue: T) => {
  const stytch = useStytch();
  const { publicToken } = readB2BInternals(stytch);
  return useInternalStorage(safeLocalStorage, publicToken, key, defaultValue);
};
