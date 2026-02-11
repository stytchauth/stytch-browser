import { useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const usePasswordsStrengthCheck = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const email = state.memberState.emailAddress.emailAddress;
  const password = state.memberState.password.password;
  const checkPasswordStrength = async () => {
    if (!password) {
      dispatch({ type: 'passwords/strengthCheck/error', error: { internalError: 'Missing password' } });
      return;
    }

    try {
      const response = await stytchClient.passwords.strengthCheck({
        email_address: email,
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
