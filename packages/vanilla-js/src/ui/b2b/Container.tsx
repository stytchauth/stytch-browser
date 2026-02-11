import React, { Dispatch, ReactNode, useEffect, useState } from 'react';
import { useTheme } from 'styled-components';
import { useSWRConfig } from 'swr';
import { useGlobalReducer, useStytch, useConfig, useErrorCallback, useEventCallback } from './GlobalContextProvider';
import { ErrorType } from './types/ErrorType';
import { AppScreens } from './types/AppScreens';
import { ErrorScreen } from '../components/ErrorScreen';
import { MainScreen } from './screens/Main';
import { EmailConfirmation } from './screens/EmailConfirmation';
import { Discovery } from './screens/Discovery';
import { ConfirmationScreen } from './screens/Confirmation';
import { LoggingInScreen } from '../components/Loading';
import {
  useExtractSlug,
  onAuthenticateSuccess,
  onDiscoveryAuthenticateSuccess,
  StytchMutationKey,
  getStytchEventByKey,
} from './utils';
import {
  AuthFlowType,
  StytchAPIError,
  StytchB2BUIConfig,
  StytchEvent,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import { EmailMethodSelectionScreen } from './screens/EmailMethodSelectionScreen';
import { EmailOTPEntryScreen } from './screens/EmailOTPEntryScreen';
import { MFAEnrollmentSelectionScreen } from './screens/MFAEnrollmentSelectionScreen';
import { PasswordResetConfirmation } from './screens/PasswordResetConfirmation';
import { PasswordResetForm } from './screens/PasswordResetForm';
import { PasswordsAuthenticate } from './screens/PasswordAuthenticate';
import { PasswordsEmailForm } from './screens/PasswordEmailForm';
import { PasswordSetNew } from './screens/PasswordSetNew';
import { PasswordsForgotForm } from './screens/PasswordForgotForm';
import { RecoveryCodeEntryScreen } from './screens/RecoveryCodeEntryScreen';
import { RecoveryCodeSaveScreen } from './screens/RecoveryCodeSaveScreen';
import { SMSOTPEnrollScreen } from './screens/SMSOTPEnrollScreen';
import { SMSOTPEntryScreen } from './screens/SMSOTPEntryScreen';
import { SSODiscoveryEmail } from './screens/SSODiscoveryEmail';
import { SSODiscoveryMenu } from './screens/SSODiscoveryMenu';
import { SSODiscoveryFallback } from './screens/SSODiscoveryFallback';
import { TOTPEnrollManualScreen } from './screens/TOTPEnrollManualScreen';
import { TOTPEnrollQRScreen } from './screens/TOTPEnrollQRScreen';
import { TOTPEntryScreen } from './screens/TOTPEntryScreen';
import { LoadingContainer, MainContainer } from '../components/MainContainer';
import { useIsOnlyFloatingOneTap } from './hooks/useIsOnlyFloatingOneTap';
import { B2BGoogleOneTap } from './components/B2BOneTap';
import { extractErrorType } from '../../utils/extractErrorType';
import { IDPConsentScreen } from './screens/IDPConsent';
import { HandledTokenType } from '../../b2b/StytchB2BHeadlessClient';
import { Action } from './reducer';

/**
 * Separately store additional things to do when authenticateByUrl completes or errors
 */
type AuthTokenConfig = {
  mutationKey: StytchMutationKey;
  // Typing this is too hard. Instead, manually verify the typings from the client matches that expected
  // by these success functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (data: any, dispatch: Dispatch<Action>, config: StytchB2BUIConfig) => void;
  defaultError?: ErrorType;
};

const authTokenConfig: Record<HandledTokenType, AuthTokenConfig> = {
  discovery: {
    mutationKey: 'stytch.magicLinks.discovery.authenticate',
    onSuccess: onDiscoveryAuthenticateSuccess,
    defaultError: ErrorType.EmailMagicLink,
  },
  discovery_oauth: {
    mutationKey: 'stytch.oauth.discovery.authenticate',
    onSuccess: onDiscoveryAuthenticateSuccess,
  },
  oauth: {
    mutationKey: 'stytch.oauth.authenticate',
    onSuccess: onAuthenticateSuccess,
  },
  sso: {
    mutationKey: 'stytch.sso.authenticate',
    onSuccess: onAuthenticateSuccess,
  },
  multi_tenant_magic_links: {
    mutationKey: 'stytch.magicLinks.authenticate',
    onSuccess: onAuthenticateSuccess,
    defaultError: ErrorType.EmailMagicLink,
  },
  multi_tenant_impersonation: {
    mutationKey: 'stytch.impersonation.authenticate',
    onSuccess: onAuthenticateSuccess,
  },
};

const errorTypeMap: Record<string, ErrorType> = {
  ad_blocker_detected: ErrorType.AdBlockerDetected,
};

const AppContainer: () => ReactNode = () => {
  const [state, dispatch] = useGlobalReducer();
  const stytchClient = useStytch();
  const triggerError = useErrorCallback();
  const triggerEvent = useEventCallback();
  const config = useConfig();
  const { displayWatermark } = useTheme();
  const isOnlyFloatingOneTap = useIsOnlyFloatingOneTap();

  const currentScreen = state.screen;

  const ScreenComponentMap: Record<AppScreens, ReactNode> = {
    [AppScreens.Main]: <MainScreen />,
    [AppScreens.EmailConfirmation]: <EmailConfirmation />,
    [AppScreens.LoggedIn]: <ConfirmationScreen />,
    [AppScreens.Discovery]: <Discovery />,
    [AppScreens.Error]: <ErrorScreen />,
    [AppScreens.PasswordEmailForm]: <PasswordsEmailForm />,
    [AppScreens.PasswordAuthenticate]: <PasswordsAuthenticate />,
    [AppScreens.PasswordResetForm]: <PasswordResetForm />,
    [AppScreens.PasswordResetVerifyConfirmation]: <PasswordResetConfirmation />,
    [AppScreens.PasswordForgotForm]: <PasswordsForgotForm />,
    [AppScreens.PasswordSetNewConfirmation]: <PasswordSetNew />,
    [AppScreens.MFAEnrollmentSelection]: <MFAEnrollmentSelectionScreen />,
    [AppScreens.SMSOTPEnrollment]: <SMSOTPEnrollScreen />,
    [AppScreens.SMSOTPEntry]: <SMSOTPEntryScreen />,
    [AppScreens.RecoveryCodeEntry]: <RecoveryCodeEntryScreen />,
    [AppScreens.RecoveryCodeSave]: <RecoveryCodeSaveScreen />,
    [AppScreens.TOTPEnrollmentQRCode]: <TOTPEnrollQRScreen />,
    [AppScreens.TOTPEnrollmentManual]: <TOTPEnrollManualScreen />,
    [AppScreens.TOTPEntry]: <TOTPEntryScreen />,
    [AppScreens.EmailMethodSelection]: <EmailMethodSelectionScreen />,
    [AppScreens.EmailOTPEntry]: <EmailOTPEntryScreen />,
    [AppScreens.SSODiscoveryEmail]: <SSODiscoveryEmail />,
    [AppScreens.SSODiscoveryFallback]: <SSODiscoveryFallback />,
    [AppScreens.SSODiscoveryMenu]: <SSODiscoveryMenu />,
    [AppScreens.IDPConsent]: <IDPConsentScreen />,
  };

  const handleStytchAPIError = (error: StytchAPIError, defaultErrorType = ErrorType.Default) => {
    const error_type = extractErrorType(error);
    const errorType: ErrorType = errorTypeMap[error_type!] ?? defaultErrorType;

    dispatch({
      type: 'set_error_message_and_transition',
      errorType,
      canGoBack: false,
    });
  };

  const [isTokenAuthLoading, setIsTokenAuthLoading] = useState(false);
  const { mutate } = useSWRConfig();

  const { slug, resultPending } = useExtractSlug();

  useEffect(() => {
    // If we're in One Tap only mode, we should not run any other effects
    if (isOnlyFloatingOneTap) {
      return;
    }

    // Similarly IDP Consent does its own management of query params - although
    // an IDP Consent screen shouldn't be used to authenticate a token it has
    // lead to confusing situations for customers
    if (state.screen === AppScreens.IDPConsent) {
      return;
    }

    // Password reset has special handling for exchanging a magic link token
    // for a session and then using it to reset a password
    if (state.flowState.type == AuthFlowType.PasswordReset) {
      return;
    }

    const parsed = stytchClient.parseAuthenticateUrl();
    if (!parsed?.handled) {
      return;
    }

    const { mutationKey, defaultError, onSuccess } = authTokenConfig[parsed.tokenType];
    setIsTokenAuthLoading(true);
    mutate(
      mutationKey,
      stytchClient.authenticateByUrl({ session_duration_minutes: config.sessionOptions.sessionDurationMinutes }),
    )
      .then(
        (result) => {
          if (!result?.handled) return; // Should not be possible
          const { data } = result;

          const event = getStytchEventByKey(mutationKey);
          if (event) {
            triggerEvent({ type: event, data } as StytchEvent<StytchProjectConfigurationInput>);
          }

          onSuccess(data, dispatch, config);
        },
        (error) => {
          triggerError(error);
          handleStytchAPIError(error, defaultError);
        },
      )
      .finally(() => setIsTokenAuthLoading(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps -- SDK-1354
  }, []);

  useEffect(() => {
    // If we're in One Tap only mode, we should not run any other effects
    if (isOnlyFloatingOneTap) {
      return;
    }

    // Skip further action if token discovery is in progress
    if (isTokenAuthLoading) {
      return;
    }

    const parsed = stytchClient.parseAuthenticateUrl();
    if (parsed?.handled) {
      return;
    }

    if (
      !slug &&
      !resultPending &&
      state.flowState.organization === null &&
      state.screen === AppScreens.Main &&
      state.flowState.type == AuthFlowType.Organization
    ) {
      // No slug found (or no slug pattern)
      dispatch({
        type: 'set_error_message_and_transition',
        errorType: ErrorType.Organization,
        canGoBack: false,
      });
    }
  }, [
    dispatch,
    isOnlyFloatingOneTap,
    isTokenAuthLoading,
    resultPending,
    slug,
    state.flowState.organization,
    state.flowState.type,
    state.screen,
    stytchClient,
    triggerError,
  ]);

  if (isOnlyFloatingOneTap) {
    return <B2BGoogleOneTap />;
  }

  if (isTokenAuthLoading) {
    return (
      <LoadingContainer>
        <LoggingInScreen />
      </LoadingContainer>
    );
  }

  return <MainContainer displayWatermark={displayWatermark}>{ScreenComponentMap[currentScreen]}</MainContainer>;
};

export default AppContainer;
