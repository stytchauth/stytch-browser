import { Messages } from '@lingui/core';
import { Theme, ThemeProvider } from '@mui/material';
import { StytchProjectConfigurationInput } from '@stytch/core/public';
import React, { useMemo } from 'react';

import { StytchB2BClient } from '../b2b/StytchB2BClient';
import { messages } from '../messages/adminPortal/en';
import { I18nProviderWrapper } from '../ui/components/atoms/I18nProviderWrapper';
import { ToastContextProvider } from './components/Toast';
import { MainContainer } from './MainContainer';
import { StytchClientContext } from './StytchClientContext';
import { AdminPortalCommonProps } from './utils/AdminPortalCommonProps';
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
      client: options.client as StytchB2BClient<StytchProjectConfigurationInput>,
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
  extends AdminPortalCommonProps<TProjectConfiguration> {
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
