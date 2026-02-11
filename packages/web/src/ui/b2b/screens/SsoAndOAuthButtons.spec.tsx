import { setTimeout } from 'node:timers/promises';

import { B2BOAuthProviders, OrganizationBySlugMatch } from '@stytch/core/public';
import { MOCK_ORGANIZATION } from '@stytch/internal-mocks';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { GoogleOneTapClient } from '../../../oneTap/GoogleOneTapClient';
import { safeLocalStorage } from '../../../utils/storage';
import { FlowDefinition, MockClient, renderWithConfig } from '../../flows/b2b/helpers';
import { emailMagicLinks, oauth, sso } from '../B2BProducts';
import { ButtonComponent, MainScreenComponent } from '../types/AppScreens';
import { getCustomScopesForProvider, getProviderParamsForProvider, SsoAndOAuthButtons } from './SsoAndOAuthButtons';

describe('getCustomScopesForProvider', () => {
  const provider: {
    type: B2BOAuthProviders;
    one_tap: boolean;
    customScopes: string[];
    providerParams: Record<string, string>;
  } = {
    type: B2BOAuthProviders.Google,
    one_tap: false,
    customScopes: ['read:cats'],
    providerParams: {
      abc: 'def',
    },
  };

  const providerWithoutCustomScopesOrProviderParams: {
    type: B2BOAuthProviders;
    one_tap: boolean;
    customScopes: string[];
    providerParams: Record<string, string>;
  } = {
    type: B2BOAuthProviders.Google,
    one_tap: false,
    customScopes: [],
    providerParams: {},
  };

  it('returns custom scopes if they exist', () => {
    expect(getCustomScopesForProvider(provider, ['other:scopes'])).toStrictEqual(['read:cats']);
  });

  it('returns custom scopes from global scopes if they do not exist in object', () => {
    expect(getCustomScopesForProvider(providerWithoutCustomScopesOrProviderParams, ['other:scopes'])).toStrictEqual([
      'other:scopes',
    ]);
  });

  it('returns provider params if they exist', () => {
    expect(getProviderParamsForProvider(provider, { other: 'params' }, undefined)).toStrictEqual({ abc: 'def' });
  });

  it('returns provider params from provider params if they do not exist in object', () => {
    expect(
      getProviderParamsForProvider(providerWithoutCustomScopesOrProviderParams, { other: 'params' }, undefined),
    ).toStrictEqual({
      other: 'params',
    });
  });

  it('injects login_hint when email is specified and provider is Google', () => {
    expect(getProviderParamsForProvider(provider, undefined, 'example@stytch.com')).toStrictEqual({
      abc: 'def',
      login_hint: 'example@stytch.com',
    });
  });

  it('injects login_hint when email is specified and provider is Microsoft', () => {
    expect(
      getProviderParamsForProvider({ ...provider, type: B2BOAuthProviders.Microsoft }, undefined, 'example@stytch.com'),
    ).toStrictEqual({
      abc: 'def',
      login_hint: 'example@stytch.com',
    });
  });

  it('does not inject login_hint when provider is not supported', () => {
    expect(
      getProviderParamsForProvider({ ...provider, type: B2BOAuthProviders.Slack }, undefined, 'example@stytch.com'),
    ).toStrictEqual({
      abc: 'def',
    });
  });

  it('does not inject login_hint when parameter is already specified', () => {
    expect(
      getProviderParamsForProvider(
        { ...provider, providerParams: { abc: 'def', login_hint: 'other@example.com' } },
        undefined,
        'example@stytch.com',
      ),
    ).toStrictEqual({
      abc: 'def',
      login_hint: 'other@example.com',
    });
  });

  it('does not inject login_hint when parameter is specified and undefined', () => {
    expect(
      getProviderParamsForProvider(
        // @ts-expect-error -- intentionally using undefined instead of string
        { ...provider, providerParams: { abc: 'def', login_hint: undefined } },
        undefined,
        'example@stytch.com',
      ),
    ).toStrictEqual({
      abc: 'def',
      login_hint: undefined,
    });
  });
});

describe('CombinedAuthButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getItemSpy = jest.spyOn(safeLocalStorage, 'getItem');
  const setItemSpy = jest.spyOn(safeLocalStorage, 'setItem');

  const mockClient = {
    sso: {
      start: jest.fn().mockResolvedValue({}),
    },
    oauth: {
      google: {
        start: jest.fn().mockResolvedValue({}),
        discovery: {
          start: jest.fn().mockResolvedValue({}),
        },
      },
      microsoft: {
        start: jest.fn().mockResolvedValue({}),
        discovery: {
          start: jest.fn().mockResolvedValue({}),
        },
      },
    },
  } satisfies MockClient;

  const mockOneTapClient: jest.Mocked<Partial<GoogleOneTapClient>> = {
    render: jest.fn().mockResolvedValue({ success: true }),
    cancel: jest.fn(),
    styleFrame: jest.fn(),
  };

  const mockInternals = {
    publicToken: 'test-public-token',
    oneTap: {
      createOneTapClient: () => Promise.resolve({ client: mockOneTapClient, success: true }),
      createOnDiscoverySuccessHandler: jest.fn(),
    },
  };

  const render = (buttons: ButtonComponent[], options: FlowDefinition) =>
    renderWithConfig(<SsoAndOAuthButtons buttons={buttons} />, {
      internals: mockInternals,
      client: mockClient,
      ...options,
    });

  it('renders Google One Tap when one_tap is true', async () => {
    render([MainScreenComponent.OAuthButtons], {
      config: {
        products: [emailMagicLinks, oauth],
        oauthOptions: {
          providers: [
            {
              type: B2BOAuthProviders.Google,
              one_tap: true,
              customScopes: [],
              providerParams: {},
              cancel_on_tap_outside: false,
            },
          ],
        },
      },
    });

    await waitFor(() => {
      expect(mockOneTapClient.render).toHaveBeenCalled();
    });
  });

  it('does not render Google One Tap when one_tap is false', async () => {
    render([MainScreenComponent.OAuthButtons], {
      config: {
        products: [emailMagicLinks, oauth],
        oauthOptions: {
          providers: [B2BOAuthProviders.Google],
        },
      },
    });

    // Wait a little to make sure the async effect is executed
    await setTimeout(10);

    await waitFor(() => {
      expect(mockOneTapClient.render).not.toHaveBeenCalled();
    });
  });

  it('renders OAuth buttons when OAuthButtons component is specified', async () => {
    render([MainScreenComponent.OAuthButtons], {
      config: {
        products: [emailMagicLinks, oauth],
        oauthOptions: {
          providers: [B2BOAuthProviders.Google, B2BOAuthProviders.Microsoft],
        },
      },
    });

    const buttons = await screen.findAllByRole('button', { name: /Continue with/ });
    expect(buttons.map((btn) => btn.textContent)).toEqual([
      'Continue with Google', //
      'Continue with Microsoft',
    ]);
  });

  it('renders SSO buttons when SSOButtons component is specified in organization flow', async () => {
    const mockSSOConnection = {
      connection_id: 'test-connection-id',
      display_name: 'Test SSO',
      identity_provider: 'google-workspace',
    };

    render([MainScreenComponent.SSOButtons], {
      config: {
        products: [emailMagicLinks, sso],
      },
      state: {
        flowState: {
          type: 'Organization',
          organization: {
            ...MOCK_ORGANIZATION,
            sso_active_connections: [mockSSOConnection],
          } as OrganizationBySlugMatch,
        },
      },
    });

    await screen.findByText('Continue with Test SSO');
  });

  it('renders SSO discovery button when SSOButtons component is specified in discovery flow', async () => {
    render([MainScreenComponent.SSOButtons], {
      config: {
        products: [emailMagicLinks, sso],
      },
      state: {
        flowState: {
          type: 'Discovery',
        },
      },
    });

    await screen.findByText('Use single sign-on');
  });

  it('respects the order of buttons in the buttons array', async () => {
    const mockSSOConnection = {
      connection_id: 'test-connection-id',
      display_name: 'Test SSO',
      identity_provider: 'google-workspace',
    };

    render([MainScreenComponent.SSOButtons, MainScreenComponent.OAuthButtons], {
      config: {
        products: [emailMagicLinks, oauth, sso],
        oauthOptions: {
          providers: [B2BOAuthProviders.Google],
        },
      },
      state: {
        flowState: {
          type: 'Organization',
          organization: {
            ...MOCK_ORGANIZATION,
            sso_active_connections: [mockSSOConnection],
          } as OrganizationBySlugMatch,
        },
      },
    });

    const buttons = await screen.findAllByRole('button', { name: /Continue with/ });
    expect(buttons.map((btn) => btn.textContent)).toEqual([
      'Continue with Test SSO', //
      'Continue with Google',
    ]);
  });

  it('shows last used indicator when a button was previously used', async () => {
    getItemSpy.mockReturnValue(B2BOAuthProviders.Google);

    render([MainScreenComponent.OAuthButtons], {
      config: {
        products: [emailMagicLinks, oauth],
        oauthOptions: {
          providers: [B2BOAuthProviders.Microsoft, B2BOAuthProviders.Google],
        },
      },
    });

    const buttons = await screen.findAllByText(/Continue with/);
    expect(buttons[0].textContent).toEqual('Continue with Google');
    screen.getByText('Last used');
  });

  it('tracks last used method when OAuth button is clicked', async () => {
    render([MainScreenComponent.OAuthButtons], {
      config: {
        products: [emailMagicLinks, oauth],
        oauthOptions: {
          providers: [B2BOAuthProviders.Google],
        },
      },
    });

    const button = await screen.findByText('Continue with Google');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockClient.oauth.google.discovery.start).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith(
        mockInternals.publicToken,
        'b2b_last_used_method',
        B2BOAuthProviders.Google,
      );
    });
  });

  it('tracks last used method when SSO button is clicked', async () => {
    const mockSSOConnection = {
      connection_id: 'test-connection-id',
      display_name: 'Test SSO',
      identity_provider: 'google-workspace',
    };

    render([MainScreenComponent.SSOButtons], {
      config: {
        products: [emailMagicLinks, sso],
      },
      state: {
        flowState: {
          type: 'Organization',
          organization: {
            ...MOCK_ORGANIZATION,
            sso_active_connections: [mockSSOConnection],
          } as OrganizationBySlugMatch,
        },
      },
    });

    const button = await screen.findByText('Continue with Test SSO');
    fireEvent.click(button);

    expect(mockClient.sso.start).toHaveBeenCalled();

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith(
        mockInternals.publicToken,
        'b2b_last_used_method',
        `sso:${mockSSOConnection.connection_id}`,
      );
    });
  });
});
