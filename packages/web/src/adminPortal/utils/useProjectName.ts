import { useBootstrap } from './useBootstrap';

export const useProjectName = () => {
  return useBootstrap().projectName ?? '';
};
