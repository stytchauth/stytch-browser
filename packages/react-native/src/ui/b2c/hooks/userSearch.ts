import { StytchAPIError } from '@stytch/core/public';
import { useGlobalReducer, useStytch } from '../ContextProvider';
import { readB2CInternals } from '../../../internals';

export const useUserSearch = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const email = state.userState.emailAddress.emailAddress;
  const searchForUser = async () => {
    dispatch({ type: 'userSearch' });

    if (!email) {
      dispatch({ type: 'userSearch/error', error: { internalError: 'Missing email address' } });
      return;
    }

    try {
      const response = await readB2CInternals(stytchClient).search.searchUser(email);
      dispatch({ type: 'userSearch/success', result: response.userType });
    } catch (e: unknown) {
      if (e instanceof StytchAPIError) {
        dispatch({ type: 'userSearch/error', error: { apiError: e } });
      } else {
        dispatch({ type: 'userSearch/error' });
      }
    }
  };
  return { searchForUser };
};
