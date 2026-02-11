import { useLingui } from '@lingui/react/macro';
import { OTPMethods } from '@stytch/core/public';
import React, { Dispatch } from 'react';

import Button from '../../../components/atoms/Button';
import Column from '../../../components/atoms/Column';
import Typography from '../../../components/atoms/Typography';
import Divider from '../../../components/molecules/Divider';
import TextColumn from '../../../components/molecules/TextColumn';
import { AppScreens, useConfig, useGlobalReducer } from '../../GlobalContextProvider';
import { Action } from '../../reducer';
import { hasProduct } from '../../utils';
import { PasswordAuthenticate } from '../Password/PasswordAuthenticate';
import { PasswordNewUser } from '../Password/PasswordNewUser';
import { PasswordlessAuthenticate } from './PasswordlessAuthenticate';
import { usePasswordlessAuthenticate } from './usePasswordlessAuthenticate';

export const PasswordCreateAuthenticate = () => {
  const { t } = useLingui();
  const { emailMagicLinksOptions, otpOptions, products } = useConfig();
  const [state, dispatch] = useGlobalReducer();

  const otpMethods = otpOptions?.methods ?? [];
  const hasEmailMagicLink = hasProduct(products, 'emailMagicLinks') && !!emailMagicLinksOptions;
  const hasOTPEmail = otpMethods.includes(OTPMethods.Email);
  const secondaryType = hasOTPEmail ? 'otp' : hasEmailMagicLink ? 'eml' : undefined;
  const userType = state.formState.passwordState.type;

  const secondaryAuth = useSecondaryAuthenticate(secondaryType, { dispatch });

  return (
    <Column gap={2}>
      {(() => {
        switch (userType) {
          case 'new':
            return (
              <Column gap={6}>
                {secondaryAuth ? (
                  <TextColumn
                    header={t({ id: 'password.createAccount.title', message: 'Create an account' })}
                    body={t({
                      id: 'createAccount.title',
                      message: 'Choose how you would like to create your account.',
                    })}
                  />
                ) : (
                  <TextColumn
                    header={t({ id: 'password.setPassword.title', message: 'Set a password' })}
                    body={t({
                      id: 'password.createAccount.content',
                      message: 'Finish creating your account by setting a password.',
                    })}
                  />
                )}

                {secondaryAuth && (
                  <Button variant="primary" onClick={secondaryAuth.handle} loading={secondaryAuth.isSubmitting}>
                    {secondaryAuth.buttonText}
                  </Button>
                )}

                {secondaryAuth && <Divider />}

                <PasswordNewUser />
              </Column>
            );

          case 'password':
            return (
              <Column gap={6}>
                <Typography variant="header">{t({ id: 'password.login.title', message: 'Log in' })}</Typography>

                <PasswordAuthenticate />

                {secondaryAuth && <Divider />}

                {secondaryAuth && (
                  <Button variant="outline" onClick={secondaryAuth.handle} loading={secondaryAuth.isSubmitting}>
                    {secondaryAuth.buttonText}
                  </Button>
                )}
              </Column>
            );

          case 'passwordless':
            return <PasswordlessAuthenticate secondaryType={secondaryType} />;
        }
      })()}

      <Button variant="ghost" onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })}>
        {t({ id: 'button.goBack', message: 'Go back' })}
      </Button>
    </Column>
  );
};

function useSecondaryAuthenticate(
  secondaryType: 'eml' | 'otp' | undefined,
  {
    dispatch,
  }: {
    dispatch: Dispatch<Action>;
  },
) {
  const { t } = useLingui();
  const { sendLink, sendCode, isSubmitting } = usePasswordlessAuthenticate();

  if (secondaryType == null) {
    return undefined;
  }

  const buttonText =
    secondaryType === 'eml'
      ? t({
          id: 'button.emailMagicLink',
          message: 'Email me a login link',
        })
      : t({
          id: 'button.emailOTP',
          message: 'Email me a login code',
        });

  const handle =
    secondaryType === 'eml'
      ? async () => {
          await sendLink();
          dispatch({ type: 'transition', screen: AppScreens.EmailConfirmation });
        }
      : async () => {
          await sendCode();
          dispatch({ type: 'transition', screen: AppScreens.OTPAuthenticate });
        };

  return {
    buttonText,
    handle,
    isSubmitting,
  };
}
