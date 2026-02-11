import { AuthFlowType } from '@stytch/core/public';
import React, { JSX, useCallback, useEffect } from 'react';
import { Linking, View } from 'react-native';

import { B2BErrorType } from '../shared/types';
import { LoadingDialog } from './components/LoadingDialog';
import { useErrorCallback, useGlobalReducer } from './ContextProvider';
import { useDeeplinkParser } from './hooks/useDeeplinkParser';
import { useGetOrganizationBySlugOnLoad } from './hooks/useGetOrganizationBySlug';
import { Screen } from './screens';
import { DiscoveryScreen } from './screens/DiscoveryScreen';
import { EmailConfirmationScreen } from './screens/EmailConfirmationScreen';
import { EmailMethodSelectionScreen } from './screens/EmailMethodSelectionScreen';
import { EmailOTPEntryScreen } from './screens/EmailOTPEntryScreen';
import { ErrorScreen } from './screens/ErrorScreen';
import { MainScreen } from './screens/MainScreen';
import { MFAEnrollmentSelectionScreen } from './screens/MFAEnrollmentSelectionScreen';
import { PasswordAuthenticateScreen } from './screens/PasswordAuthenticateScreen';
import { PasswordForgotFormScreen } from './screens/PasswordForgotFormScreen';
import { PasswordResetFormScreen } from './screens/PasswordResetFormScreen';
import { PasswordResetVerifyConfirmationScreen } from './screens/PasswordResetVerifyConfirmationScreen';
import { PasswordSetNewScreen } from './screens/PasswordSetNew';
import { PasswordSetNewConfirmationScreen } from './screens/PasswordSetNewConfirmationScreen';
import { RecoveryCodeEntryScreen } from './screens/RecoveryCodeEntryScreen';
import { RecoveryCodeSaveScreen } from './screens/RecoveryCodeSaveScreen';
import { SMSOTPEnrollmentScreen } from './screens/SMSOTPEnrollmentScreen';
import { SMSOTPEntryScreen } from './screens/SMSOTPEntryScreen';
import { SSODiscoveryEmailScreen } from './screens/SSODiscoveryEmailScreen';
import { SSODiscoveryFallbackScreen } from './screens/SSODiscoveryFallbackScreen';
import { SSODiscoveryMenuScreen } from './screens/SSODiscoveryMenuScreen';
import { SuccessScreen } from './screens/SuccessScreen';
import { TOTPEnrollmentManualScreen } from './screens/TOTPEnrollmentManualScreen';
import { TOTPEntryScreen } from './screens/TOTPEntryScreen';

export const StytchB2BUIContainer: () => JSX.Element = () => {
  const [state, dispatch] = useGlobalReducer();
  const { parseDeeplink } = useDeeplinkParser();
  const { isSearching, slug } = useGetOrganizationBySlugOnLoad();
  const onError = useErrorCallback();
  const currentScreen = state.screen;
  const ScreenComponentMap: Record<Screen, JSX.Element> = {
    [Screen.Main]: <MainScreen />,
    [Screen.EmailConfirmation]: <EmailConfirmationScreen />,
    [Screen.Success]: <SuccessScreen />,
    [Screen.Discovery]: <DiscoveryScreen />,
    [Screen.Error]: <ErrorScreen />,
    [Screen.PasswordAuthenticate]: <PasswordAuthenticateScreen />,
    [Screen.PasswordResetForm]: <PasswordResetFormScreen />,
    [Screen.PasswordResetVerifyConfirmation]: <PasswordResetVerifyConfirmationScreen />,
    [Screen.PasswordForgotForm]: <PasswordForgotFormScreen />,
    [Screen.PasswordSetNew]: <PasswordSetNewScreen />,
    [Screen.PasswordSetNewConfirmation]: <PasswordSetNewConfirmationScreen />,
    [Screen.MFAEnrollmentSelection]: <MFAEnrollmentSelectionScreen />,
    [Screen.RecoveryCodeEntry]: <RecoveryCodeEntryScreen />,
    [Screen.RecoveryCodeSave]: <RecoveryCodeSaveScreen />,
    [Screen.SMSOTPEnrollment]: <SMSOTPEnrollmentScreen />,
    [Screen.SMSOTPEntry]: <SMSOTPEntryScreen />,
    [Screen.TOTPEnrollmentManual]: <TOTPEnrollmentManualScreen />,
    [Screen.TOTPEntry]: <TOTPEntryScreen />,
    [Screen.EmailMethodSelection]: <EmailMethodSelectionScreen />,
    [Screen.EmailOTPEntry]: <EmailOTPEntryScreen />,
    [Screen.SSODiscoveryEmail]: <SSODiscoveryEmailScreen />,
    [Screen.SSODiscoveryFallback]: <SSODiscoveryFallbackScreen />,
    [Screen.SSODiscoveryMenu]: <SSODiscoveryMenuScreen />,
  };
  const { isParsingDeeplink, deeplinksHandled, handlerRegistered } = state.deeplinkState;
  const deeplinkHandler = useCallback(
    ({ url }: { url: string }) => {
      const isStytchDeeplink = url.startsWith('stytch-ui');
      const hasParsedThisDeeplink = deeplinksHandled.includes(url);
      if (isStytchDeeplink && !isParsingDeeplink && !hasParsedThisDeeplink) {
        parseDeeplink(url);
      }
    },
    [deeplinksHandled, isParsingDeeplink, parseDeeplink],
  );

  useEffect(() => {
    return () => Linking.removeAllListeners('url');
  }, []);

  useEffect(() => {
    if (!handlerRegistered) {
      dispatch({ type: 'deeplink/handlerRegistered' });
      Linking.addEventListener('url', deeplinkHandler);
    }
  }, [handlerRegistered, dispatch, deeplinkHandler]);

  useEffect(() => {
    if (
      !slug &&
      !isSearching &&
      state.authenticationState.organization === null &&
      state.screen === Screen.Main &&
      state.authenticationState.authFlowType == AuthFlowType.Organization
    ) {
      // No slug found (or no slug pattern)
      dispatch({ type: 'navigate/to', screen: Screen.Error, error: { internalError: B2BErrorType.Organization } });
    }
  }, [
    slug,
    isSearching,
    state.authenticationState.organization,
    state.screen,
    state.authenticationState.authFlowType,
    dispatch,
  ]);

  useEffect(() => {
    if (state.screenState.error) {
      onError({ message: state.screenState.error as string });
    }
  }, [state.screenState.error, onError]);

  if (isSearching) {
    return <LoadingDialog />;
  }

  return (
    <>
      <View testID="StytchB2BUI" style={{ height: '100%' }}>
        {ScreenComponentMap[currentScreen]}
      </View>
      {state.screenState.isSubmitting && <LoadingDialog />}
    </>
  );
};
