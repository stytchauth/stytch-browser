import {
  useClickToCopyCore,
  UseClickToCopyCoreParams,
  UseClickToCopyCoreReturnType,
} from '../shared/utils/clickToCopyUtils';

type UseClickToCopyParams = UseClickToCopyCoreParams;

type UseClickToCopyReturnType = UseClickToCopyCoreReturnType;

export const useClickToCopy = (params: UseClickToCopyParams): UseClickToCopyReturnType => {
  return useClickToCopyCore({ ...params, iconSize: 'inherit' });
};
