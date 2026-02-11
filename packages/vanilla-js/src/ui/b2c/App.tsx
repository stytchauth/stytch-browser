import { Messages } from '@lingui/core';
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { messages } from '../../messages/en';
import { I18nProviderWrapper } from '../components/I18nProviderWrapper';
import { CreateSSRSafeWebComponent } from '../CreateWebComponent';
import { GlobalContextProvider, DEFAULT_STATE, AppState, AppScreens, DEFAULT_CONFIG } from './GlobalContextProvider';
import Container from './Container';
import { SDKConfig, ResetPasswordSDKConfig, IDPSDKConfig } from '../../types';
import { readB2CInternals } from '../../utils/internal';
import { useTheme } from '../theme';
import { StytchProjectConfigurationInput } from '@stytch/core/public';
import { IDPContextProvider } from '../components/IDPContextProvider';

export const AppContainer = <TProjectConfiguration extends StytchProjectConfigurationInput>({
  client,
  config,
  styles,
  callbacks,
  strings,
}: SDKConfig<TProjectConfiguration>) => {
  /**
   * Read the watermark out of sync storage, then read it out of async storage
   */
  const [displayWatermark, setDisplayWatermark] = useState(() => {
    const { displayWatermark } = readB2CInternals(client).bootstrap.getSync();
    return displayWatermark;
  });
  useEffect(() => {
    readB2CInternals(client)
      .bootstrap.getAsync()
      .then((data) => {
        readB2CInternals(client).networkClient.logEvent({
          name: 'render_login_screen',
          details: { options: config, bootstrap: data },
        });
        setDisplayWatermark(data.displayWatermark);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- SDK-1354
  }, [client]);

  const theme = useTheme({ styles, displayWatermark });

  return (
    <GlobalContextProvider client={client} config={config} callbacks={callbacks}>
      <ThemeProvider theme={theme}>
        <I18nProviderWrapper messages={messages as unknown as Messages} overrides={strings}>
          <Container />
        </I18nProviderWrapper>
      </ThemeProvider>
    </GlobalContextProvider>
  );
};

export const ResetPasswordContainer = <TProjectConfiguration extends StytchProjectConfigurationInput>({
  client,
  config,
  styles,
  callbacks,
  strings,
  passwordResetToken,
}: ResetPasswordSDKConfig<TProjectConfiguration>) => {
  /**
   * Read the watermark out of sync storage, then read it out of async storage
   */
  const [displayWatermark, setDisplayWatermark] = useState(() => {
    const { displayWatermark } = readB2CInternals(client).bootstrap.getSync();
    return displayWatermark;
  });

  const initialState: AppState = {
    ...DEFAULT_STATE,
    screen: AppScreens.PasswordResetForm,
    formState: {
      ...DEFAULT_STATE.formState,
      resetPasswordState: {
        token: passwordResetToken,
      },
    },
  };

  useEffect(() => {
    readB2CInternals(client)
      .bootstrap.getAsync()
      .then(({ displayWatermark }) => {
        setDisplayWatermark(displayWatermark);
      });
  }, [client]);

  /**
   * Recreate the theme each time the styles config obj changes
   */
  const theme = useTheme({ styles, displayWatermark });

  return (
    <GlobalContextProvider client={client} config={config} callbacks={callbacks} initialState={initialState}>
      <ThemeProvider theme={theme}>
        <I18nProviderWrapper messages={messages as unknown as Messages} overrides={strings}>
          <Container />
        </I18nProviderWrapper>
      </ThemeProvider>
    </GlobalContextProvider>
  );
};

export const PasskeyRegistrationContainer = <TProjectConfiguration extends StytchProjectConfigurationInput>({
  client,
  config,
  styles,
  callbacks,
  strings,
}: SDKConfig<TProjectConfiguration>) => {
  /**
   * Read the watermark out of sync storage, then read it out of async storage
   */
  const [displayWatermark, setDisplayWatermark] = useState(() => {
    const { displayWatermark } = readB2CInternals(client).bootstrap.getSync();
    return displayWatermark;
  });

  const initialState: AppState = {
    ...DEFAULT_STATE,
    screen: AppScreens.PasskeyRegistrationStart,
    formState: {
      ...DEFAULT_STATE.formState,
    },
  };

  useEffect(() => {
    readB2CInternals(client)
      .bootstrap.getAsync()
      .then(({ displayWatermark }) => {
        setDisplayWatermark(displayWatermark);
      });
  }, [client]);

  /**
   * Recreate the theme each time the styles config obj changes
   */
  const theme = useTheme({ styles, displayWatermark });

  return (
    <GlobalContextProvider client={client} config={config} callbacks={callbacks} initialState={initialState}>
      <ThemeProvider theme={theme}>
        <I18nProviderWrapper messages={messages as unknown as Messages} overrides={strings}>
          <Container />
        </I18nProviderWrapper>
      </ThemeProvider>
    </GlobalContextProvider>
  );
};

export const IDPContainer = <TProjectConfiguration extends StytchProjectConfigurationInput>({
  client,
  styles,
  callbacks,
  strings,
  getIDPConsentManifest,
  authTokenParams,
}: IDPSDKConfig<TProjectConfiguration>) => {
  const initialState: AppState = {
    ...DEFAULT_STATE,
    screen: AppScreens.IDPConsent,
  };

  /**
   * Recreate the theme each time the styles config obj changes
   */
  const theme = useTheme({ styles, displayWatermark: false });

  useEffect(() => {
    readB2CInternals(client)
      .bootstrap.getAsync()
      .then((data) => {
        readB2CInternals(client).networkClient.logEvent({
          name: 'render_idp_screen',
          details: { bootstrap: data },
        });
      });
  }, [client]);

  return (
    <GlobalContextProvider client={client} config={DEFAULT_CONFIG} callbacks={callbacks} initialState={initialState}>
      <IDPContextProvider consentManifestGenerator={getIDPConsentManifest} authTokenParams={authTokenParams}>
        <ThemeProvider theme={theme}>
          <I18nProviderWrapper messages={messages as unknown as Messages} overrides={strings}>
            <Container />
          </I18nProviderWrapper>
        </ThemeProvider>
      </IDPContextProvider>
    </GlobalContextProvider>
  );
};

export const UI_SCREEN_WEB_COMPONENT_NAME = 'stytch-ui';
export const UI_RESET_PASSWORD_WEB_COMPONENT_NAME = 'stytch-reset-password';
export const UI_PASSKEY_REGISTRATION_WEB_COMPONENT_NAME = 'stytch-passkey-registration';
export const UI_IDP_WEB_COMPONENT_NAME = 'stytch-identity-provider';

export const UILoginComponent = CreateSSRSafeWebComponent(AppContainer, UI_SCREEN_WEB_COMPONENT_NAME);

export const UIResetPasswordComponent = CreateSSRSafeWebComponent(
  ResetPasswordContainer,
  UI_RESET_PASSWORD_WEB_COMPONENT_NAME,
);

export const UIPasskeyRegistrationComponent = CreateSSRSafeWebComponent(
  PasskeyRegistrationContainer,
  UI_PASSKEY_REGISTRATION_WEB_COMPONENT_NAME,
);

export const UIIdentityProviderComponent = CreateSSRSafeWebComponent(IDPContainer, UI_IDP_WEB_COMPONENT_NAME);
