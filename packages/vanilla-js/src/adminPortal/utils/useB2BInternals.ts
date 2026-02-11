import { readB2BInternals } from '../../utils/internal';
import { useStytchClient } from './useStytchClient';

export const useB2BInternals = () => {
  const client = useStytchClient();
  return readB2BInternals(client);
};
