import { Messages } from '@lingui/core';
import { Theme, ThemeProvider } from '@mui/material';
import { StytchProjectConfigurationInput } from '@stytch/core/public';
import React, { useMemo } from 'react';
import { messages } from '../messages/adminPortal/en';
import { StytchB2BHeadlessClient } from '../b2b/StytchB2BHeadlessClient';
import { I18nProviderWrapper } from '../ui/components/I18nProviderWrapper';
import { MainContainer } from './MainContainer';
import { StytchClientContext } from './StytchClientContext';
import { ToastContextProvider } from './components/Toast';
import { AdminPortalComponentMountOptions } from './makeAdminPortalComponentMountFn';
import { getTheme } from './utils/theme';

const ContextProvider = <TProjectConfiguration extends StytchProjectConfigurationInput, TMountOptions>({
  theme,
  options,
  children,
}: {
  theme: Theme;
  options: AdminPortalOptions<TProjectConfiguration, TMountOptions>;
  children?: React.ReactNode;
}) => {
  const clientAndConfig = useMemo(
    () => ({
      client: options.client as StytchB2BHeadlessClient<StytchProjectConfigurationInput>,
      config: options.config,
    }),
    [options],
  );
  return (
    <ThemeProvider theme={theme}>
      <I18nProviderWrapper messages={messages as Messages}>
        <StytchClientContext.Provider value={clientAndConfig}>{children}</StytchClientContext.Provider>
      </I18nProviderWrapper>
    </ThemeProvider>
  );
};

interface AdminPortalOptions<TProjectConfiguration extends StytchProjectConfigurationInput, TMountOptions>
  extends AdminPortalComponentMountOptions<TProjectConfiguration> {
  config?: TMountOptions;
}

export const AdminPortalWrapper = <TProjectConfiguration extends StytchProjectConfigurationInput, TMountOptions>({
  children,
  options,
}: {
  children?: React.ReactNode;
  options: AdminPortalOptions<TProjectConfiguration, TMountOptions>;
}) => {
  const theme = getTheme(options.styles);

  return (
    <ContextProvider options={options} theme={theme}>
      <MainContainer>
        <ToastContextProvider>{children}</ToastContextProvider>
      </MainContainer>
    </ContextProvider>
  );
};
