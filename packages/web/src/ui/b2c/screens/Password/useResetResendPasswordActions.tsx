import { convertMagicLinkOptions, convertPasswordResetOptions } from '../../../../utils';
import { AppScreens, useConfig, useGlobalReducer, useStytch } from '../../GlobalContextProvider';

/**
 * Handle the common behavior part of email actions, used in conjunction with <EmailActionLayout>
 */
export function useResetResendPasswordActions() {
  const [state, dispatch] = useGlobalReducer();
  const stytchClient = useStytch();
  const email = state.formState.passwordState.email;
  const { emailMagicLinksOptions, passwordOptions } = useConfig();

  return {
    email,

    resendResetPassword: () =>
      stytchClient.passwords.resetByEmailStart(convertPasswordResetOptions(email, passwordOptions)),

    sendMagicLink: async () => {
      const result = await stytchClient.magicLinks.email.loginOrCreate(
        email,
        convertMagicLinkOptions(emailMagicLinksOptions),
      );
      dispatch({ type: 'transition', screen: AppScreens.EmailConfirmation });
      return result;
    },

    goBack: () => dispatch({ type: 'transition', screen: AppScreens.Main }),
  };
}
