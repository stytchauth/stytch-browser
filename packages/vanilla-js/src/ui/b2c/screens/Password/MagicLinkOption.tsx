import React from 'react';
import { useLingui } from '@lingui/react/macro';
import Button from '../../../components/Button';
import { Divider } from '../../../components/Divider';
import { AppScreens, useConfig, useGlobalReducer, useStytch } from '../../GlobalContextProvider';
import { convertMagicLinkOptions } from '../../../../utils';

export const MagicLinkOption = () => {
  const { t } = useLingui();
  const [state, dispatch] = useGlobalReducer();
  const stytchClient = useStytch();
  const config = useConfig();
  const emailMagicLinksOptions = config.emailMagicLinksOptions;
  const email = state.formState.passwordState.email;

  const sendMagicLink = () => {
    stytchClient.magicLinks.email.loginOrCreate(email, convertMagicLinkOptions(emailMagicLinksOptions)).then(() => {
      dispatch({ type: 'transition', screen: AppScreens.EmailConfirmation });
    });
  };

  return (
    <>
      <Divider />
      <Button type="button" variant="text" onClick={sendMagicLink}>
        {t({ id: 'button.loginWithoutPassword', message: 'Login without a password' })}
      </Button>
    </>
  );
};
