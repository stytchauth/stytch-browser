import React from 'react';

import { B2BProducts } from '../config';
import { useConfig, useGlobalReducer } from '../ContextProvider';
import { useEmailOTPEmailDiscoverySend } from '../hooks/useEmailOTPEmailDiscoverySend';
import { useEmailOTPEmailLoginOrSignup } from '../hooks/useEmailOTPEmailLoginOrSignup';
import { useMagicLinksEmailDiscoverySend } from '../hooks/useMagicLinksEmailDiscoverySend';
import { useMagicLinksEmailLoginOrSignup } from '../hooks/useMagicLinksEmailLoginOrSignup';
import { Screen } from '../screens';
import { EmailEntryForm } from './EmailEntryForm';
import { StytchButton } from './StytchButton';

export type EMAIL_LOGIN_TYPE = 'loginOrSignup' | 'discoverySend';

export const EmailForm = ({ action }: { action: EMAIL_LOGIN_TYPE }) => {
  const [state, dispatch] = useGlobalReducer();
  const config = useConfig();
  const { magicLinksEmailLoginOrSignup } = useMagicLinksEmailLoginOrSignup();
  const { magicLinksEmailDiscoverySend } = useMagicLinksEmailDiscoverySend();
  const { emailOTPEmailLoginOrSignup } = useEmailOTPEmailLoginOrSignup();
  const { emailOTPEmailDiscoverySend } = useEmailOTPEmailDiscoverySend();
  const onSubmit = () => {
    if (
      config.productConfig.products.includes(B2BProducts.emailOtp) &&
      config.productConfig.products.includes(B2BProducts.emailMagicLinks)
    ) {
      dispatch({
        type: 'navigate/to',
        screen: Screen.EmailMethodSelection,
      });
    } else if (config.productConfig.products.includes(B2BProducts.emailMagicLinks)) {
      if (action == 'loginOrSignup') {
        magicLinksEmailLoginOrSignup();
      } else {
        magicLinksEmailDiscoverySend();
      }
    } else if (config.productConfig.products.includes(B2BProducts.emailOtp)) {
      if (action == 'loginOrSignup') {
        emailOTPEmailLoginOrSignup();
      } else {
        emailOTPEmailDiscoverySend();
      }
    }
  };
  return (
    <>
      <EmailEntryForm returnKeyType="done" onSubmitEditing={onSubmit} />
      <StytchButton
        onPress={onSubmit}
        enabled={state.memberState.emailAddress.isValid == true && !state.screenState.isSubmitting}
        text={'Continue with email'}
      />
    </>
  );
};
