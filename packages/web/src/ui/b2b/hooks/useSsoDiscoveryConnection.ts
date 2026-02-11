import { useStytch } from '../GlobalContextProvider';
import { useMutate } from '../utils';

export const useSsoDiscoveryConnection = () => {
  const stytch = useStytch();

  return useMutate(
    'stytch.sso.discoverConnections',
    async (_key, { arg: { emailAddress } }: { arg: { emailAddress: string } }) =>
      await stytch.sso.discoverConnections(emailAddress),
    { throwOnError: true },
  );
};
