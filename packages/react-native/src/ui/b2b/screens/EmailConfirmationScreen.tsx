import React from 'react';

import { EmailVerification } from '../components/EmailVerification';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useGlobalReducer } from '../ContextProvider';

export const EmailConfirmationScreen = () => {
  const [, dispatch] = useGlobalReducer();
  return (
    <ScreenWrapper testID="EmailConfirmationScreen">
      <EmailVerification
        title="Check your email"
        message="An email was sent to"
        primarySubtext="Didn’t get it?"
        secondaryBoldSubtext="Try Again"
        onPress={() => {
          dispatch({ type: 'navigate/reset' });
        }}
      />
    </ScreenWrapper>
  );
};
