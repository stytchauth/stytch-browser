import React from 'react';

import { OAuthProviders, Products, StytchLoginConfig, StyleConfig as StytchUIStyleConfig } from '@stytch/vanilla-js';

import { expectToThrow } from '@stytch/internal-test-utils';
import { render } from '@testing-library/react';
import { StytchLogin, StytchProvider } from '.';

const mockStytchClient = {
  user: { getSync: () => null, getInfo: () => ({}), onChange: () => () => null },
  session: { getSync: () => null, getInfo: () => ({}), onChange: () => () => null },
  onStateChange: () => () => null,
  mountLogin: jest.fn(),
} as any;

beforeEach(() => {
  jest.resetAllMocks();
});

describe('StytchLogin', () => {
  const stytchUIConfig: StytchLoginConfig = {
    emailMagicLinksOptions: {
      createUserAsPending: true,
      loginExpirationMinutes: 30,
      loginRedirectURL: 'https://example.com/authenticate',
      signupExpirationMinutes: 30,
      signupRedirectURL: 'https://example.com/authenticate',
    },
    oauthOptions: {
      providers: [{ type: OAuthProviders.Google }, { type: OAuthProviders.Microsoft }, { type: OAuthProviders.Apple }],
    },
    products: [Products.emailMagicLinks, Products.oauth],
  };

  const stytchStyleConfig: StytchUIStyleConfig = {
    fontFamily: '"Helvetica New", Helvetica, sans-serif',
  };

  it('expect error when not inside a StytchProvider', async () => {
    expectToThrow(
      () => render(<StytchLogin config={stytchUIConfig} styles={stytchStyleConfig} />),
      '<StytchLogin /> can only be used inside <StytchProvider>.',
    );
  });

  it('expect error when given a headless client', async () => {
    const { mountLogin, ...mockStytchHeadlessClient } = mockStytchClient;
    expectToThrow(
      () =>
        render(
          <StytchProvider stytch={mockStytchHeadlessClient}>
            <StytchLogin config={stytchUIConfig} styles={stytchStyleConfig} />
          </StytchProvider>,
        ),
      'You must use the UI SDK to use UI elements.',
    );
  });

  it('Creates a div and invokes stytchClient#mountLogin', async () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.123456);

    const { asFragment } = render(
      <StytchProvider stytch={mockStytchClient}>
        <StytchLogin config={stytchUIConfig} styles={stytchStyleConfig} />
      </StytchProvider>,
    );

    expect(mockStytchClient.mountLogin).toHaveBeenCalledWith({
      elementId: '#stytch-magic-link-123456',
      config: stytchUIConfig,
      styles: stytchStyleConfig,
    });

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          id="stytch-magic-link-123456"
        />
      </DocumentFragment>
    `);
  });

  it('Invokes stytchClient#mountLogin again when properties change', async () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.123456);

    const { rerender } = render(
      <StytchProvider stytch={mockStytchClient}>
        <StytchLogin config={stytchUIConfig} styles={stytchStyleConfig} />
      </StytchProvider>,
    );

    expect(mockStytchClient.mountLogin).toHaveBeenCalledWith({
      elementId: '#stytch-magic-link-123456',
      config: stytchUIConfig,
      styles: stytchStyleConfig,
    });

    const newStyleConfig = { ...stytchStyleConfig, width: '5000px' };

    rerender(
      <StytchProvider stytch={mockStytchClient}>
        <StytchLogin config={stytchUIConfig} styles={newStyleConfig} />
      </StytchProvider>,
    );

    expect(mockStytchClient.mountLogin).toHaveBeenCalledWith({
      elementId: '#stytch-magic-link-123456',
      config: stytchUIConfig,
      styles: newStyleConfig,
    });

    rerender(
      <StytchProvider stytch={mockStytchClient}>
        <StytchLogin config={stytchUIConfig} styles={newStyleConfig} />
      </StytchProvider>,
    );

    // third rerender should not have done anything
    expect(mockStytchClient.mountLogin).toHaveBeenCalledTimes(2);
  });

  it('Creates two unique divs when invoked twice on the same page', async () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.123456).mockReturnValueOnce(0.789012);

    const { asFragment } = render(
      <StytchProvider stytch={mockStytchClient}>
        <StytchLogin config={stytchUIConfig} styles={stytchStyleConfig} />
        <StytchLogin config={stytchUIConfig} styles={stytchStyleConfig} />
      </StytchProvider>,
    );
    expect(mockStytchClient.mountLogin).toHaveBeenCalledTimes(2);
    expect(mockStytchClient.mountLogin).toHaveBeenCalledWith(
      expect.objectContaining({
        elementId: '#stytch-magic-link-123456',
      }),
    );
    expect(mockStytchClient.mountLogin).toHaveBeenCalledWith(
      expect.objectContaining({
        elementId: '#stytch-magic-link-789012',
      }),
    );

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          id="stytch-magic-link-123456"
        />
        <div
          id="stytch-magic-link-789012"
        />
      </DocumentFragment>
    `);
  });
});
