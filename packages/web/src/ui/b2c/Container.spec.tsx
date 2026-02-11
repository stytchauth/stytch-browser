import { OAuthProviders, OneTapPositions } from '@stytch/core/public';
import React from 'react';

import { messages } from '../../messages/en';
import { MockGlobalContextProvider, render } from '../../testUtils';
import { I18nProviderWrapper } from '../components/atoms/I18nProviderWrapper';
import Container from './Container';
import { oauth } from './Products';

describe('AppContainer', () => {
  it('renders FloatingOneTap when isOnlyFloatingOneTap is true', () => {
    const config = {
      products: [oauth],
      oauthOptions: {
        providers: [
          {
            type: OAuthProviders.Google,
            one_tap: true,
            position: OneTapPositions.floating,
          },
        ],
      },
    };

    const { container } = render(
      <MockGlobalContextProvider config={config}>
        <I18nProviderWrapper messages={messages}>
          <Container />
        </I18nProviderWrapper>
      </MockGlobalContextProvider>,
    );

    // We use querySelector since this is just a placeholder for the one tap script to inject into
    // so it has no accessibility properties or anything else testing library queries can use
    // eslint-disable-next-line testing-library/no-container
    expect(container.querySelector('#google-parent-prompt')).not.toBeNull();
  });
});
