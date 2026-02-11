import { useB2BInternals } from './useB2BInternals';

export const useNetworkClient = () => {
  const { networkClient } = useB2BInternals();
  return networkClient;
};
