import { Messages } from '@lingui/core';
import { AuthFlowType, StyleConfig } from '@stytch/core/public';
import { render, screen } from '@testing-library/preact';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { messages } from '../../../messages/b2b/en';
import { I18nProviderWrapper } from '../../components/I18nProviderWrapper';
import { MockGlobalContextProvider } from '../../flows/b2b/helpers';
import { createTheme } from '../../theme';
import { MainScreen } from './Main';

const createWrapper = (styles: StyleConfig = {}) => {
  const mockConfig = { authFlowType: AuthFlowType.Discovery };

  return ({ children }: { children: React.ReactNode }) => (
    <MockGlobalContextProvider config={mockConfig}>
      <ThemeProvider theme={createTheme(styles)}>
        <I18nProviderWrapper messages={messages as Messages}>{children}</I18nProviderWrapper>
      </ThemeProvider>
    </MockGlobalContextProvider>
  );
};

describe('Main screen', () => {
  it('shows header text by default', () => {
    render(<MainScreen />, { wrapper: createWrapper() });

    expect(screen.getByText('Sign up or log in')).toBeTruthy();
  });

  it('hides header text when configured', () => {
    render(<MainScreen />, { wrapper: createWrapper({ hideHeaderText: true }) });

    expect(screen.queryByText('Sign up or log in')).toBeNull();
  });
});
