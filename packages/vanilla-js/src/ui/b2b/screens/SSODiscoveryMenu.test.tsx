import React from 'react';
import { AuthFlowType, SSOActiveConnection } from '@stytch/core/public';
import { MOCK_SSO_CONNECTIONS } from '@stytch/internal-mocks';
import { render, screen, fireEvent, waitFor } from '../../../testUtils';
import { MockClient, MockGlobalContextProvider } from '../../flows/b2b/helpers';
import { SSODiscoveryMenu } from './SSODiscoveryMenu';
import { safeLocalStorage } from '../../../utils/storage';

const ssoStartMock = jest.fn().mockResolvedValue({});
const mockStytchClient: MockClient = {
  sso: {
    start: ssoStartMock,
  },
};

const mockPublicToken = 'test-public-token';

// Common render function
const renderSSODiscoveryMenu = ({
  lastUsedSso = null,
  connections = MOCK_SSO_CONNECTIONS,
}: {
  lastUsedSso?: string | null;
  connections?: SSOActiveConnection[];
} = {}) => {
  // Mock localStorage
  jest.spyOn(safeLocalStorage, 'getItem').mockReturnValue(lastUsedSso);
  jest.spyOn(safeLocalStorage, 'setItem').mockImplementation(jest.fn());

  return render(
    <MockGlobalContextProvider
      config={{ authFlowType: AuthFlowType.Organization }}
      internals={{ publicToken: mockPublicToken }}
      client={mockStytchClient}
      state={{
        formState: {
          ssoDiscoveryState: {
            connections,
          },
        },
      }}
    >
      <SSODiscoveryMenu />
    </MockGlobalContextProvider>,
  );
};

describe('SSODiscoveryMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all SSO connections in their original order when no last used connection exists', () => {
    renderSSODiscoveryMenu();

    // Verify the order is unchanged (filter out the back button)
    const buttons = screen.getAllByRole('button', { name: /Continue with/ });
    expect(buttons.map((b) => b.textContent)).toEqual([
      'Continue with Google Workspace',
      'Continue with Microsoft Entra',
      'Continue with Okta',
    ]);
  });

  it('should move the last used SSO connection to the front and show "Last used" label', () => {
    renderSSODiscoveryMenu({ lastUsedSso: 'sso:connection-2' });

    // Check that "Last used" label is displayed
    expect(screen.getByText('Last used')).toBeTruthy();

    // Verify Microsoft Entra (connection-2) is now first (filter out the back button)
    const buttons = screen.getAllByRole('button', { name: /Continue with/ });
    expect(buttons.map((b) => b.textContent)).toEqual([
      'Continue with Microsoft Entra',
      'Continue with Google Workspace',
      'Continue with Okta',
    ]);
  });

  it('should handle case when last used connection ID does not exist in current connections', () => {
    renderSSODiscoveryMenu({ lastUsedSso: 'sso:non-existent-connection' });

    // Should not show "Last used" label
    expect(screen.queryByText('Last used')).toBeNull();

    // Order should remain unchanged (filter out the back button)
    const buttons = screen.getAllByRole('button', { name: /Continue with/ });
    expect(buttons.map((b) => b.textContent)).toEqual([
      'Continue with Google Workspace',
      'Continue with Microsoft Entra',
      'Continue with Okta',
    ]);
  });

  it('should save the connection ID to localStorage when an SSO button is clicked', async () => {
    renderSSODiscoveryMenu();

    const firstButton = screen.getByText('Continue with Google Workspace');
    fireEvent.click(firstButton);

    await waitFor(() => {
      expect(safeLocalStorage.setItem).toHaveBeenCalledWith(
        mockPublicToken,
        'b2b_last_used_method',
        'sso:connection-1',
      );
    });

    expect(ssoStartMock).toHaveBeenCalledWith(
      expect.objectContaining({
        connection_id: 'connection-1',
      }),
    );
  });
});
