import { Platform } from '../../../native-module/types';
import { usePlatform } from '../ContextProvider';

export const useFonts = () => {
  const platform = usePlatform();
  const getFontFor = (name: string): string => {
    if (platform == Platform.iOS) {
      return name.replace('_', '-');
    } else {
      return name;
    }
  };
  return { getFontFor };
};
