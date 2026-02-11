import { useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const usePasswordsStrengthCheck = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const email = state.userState.emailAddress.emailAddress;
  const password = state.userState.password.password;
  const checkPasswordStrength = async () => {
    dispatch({ type: 'passwords/strengthCheck' });

    if (!email) {
      dispatch({ type: 'passwords/strengthCheck/error', error: { internalError: 'Missing email address' } });
      return;
    }

    if (!password) {
      dispatch({ type: 'passwords/strengthCheck/error', error: { internalError: 'Missing password' } });
      return;
    }

    try {
      const response = await stytchClient.passwords.strengthCheck({
        email: email,
        password: password,
      });
      dispatch({ type: 'passwords/strengthCheck/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'passwords/strengthCheck/error', error: errorResponse });
    }
  };
  return { checkPasswordStrength };
};
