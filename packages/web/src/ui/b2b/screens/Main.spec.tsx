import { Messages } from '@lingui/core';
import { AuthFlowType, StyleConfig } from '@stytch/core/public';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { messages } from '../../../messages/b2b/en';
import { I18nProviderWrapper } from '../../components/atoms/I18nProviderWrapper';
import { PresentationContext, usePresentationWithDefault } from '../../components/PresentationConfig';
import { MockGlobalContextProvider } from '../../flows/b2b/helpers';
import { MainScreen } from './Main';

const createWrapper = (styles: StyleConfig = {}) => {
  const mockConfig = { authFlowType: AuthFlowType.Discovery };
  const { hideHeaderText } = styles;

  return ({ children }: { children: React.ReactNode }) => {
    const presentationValue = usePresentationWithDefault({ options: { hideHeaderText } }, false, { products: [] });
    return (
      <MockGlobalContextProvider config={mockConfig}>
        <PresentationContext.Provider value={presentationValue}>
          <I18nProviderWrapper messages={messages as Messages}>{children}</I18nProviderWrapper>
        </PresentationContext.Provider>
      </MockGlobalContextProvider>
    );
  };
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
