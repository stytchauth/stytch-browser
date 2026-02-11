import { expectToThrow } from '@stytch/internal-test-utils';
import { Member, MemberSession, Organization } from '@stytch/web/b2b';
import { StytchB2BClient } from '@stytch/web/b2b/headless';
import { act, render, waitFor } from '@testing-library/react';
import React, { ReactElement, useEffect } from 'react';
import type { PartialDeep } from 'type-fest';

import { noProviderError } from '../utils/errors';
import {
  StytchB2BProvider,
  StytchB2BProviderProps,
  useStytchB2BClient,
  useStytchIsAuthorized,
  useStytchMember,
  useStytchMemberSession,
  useStytchOrganization,
  withStytchB2BClient,
  withStytchMember,
  withStytchMemberSession,
  withStytchOrganization,
  withStytchPermissions,
} from './StytchB2BContext';

const captureValue = jest.fn();
const memberUnsubscribeStub = jest.fn();
const memberSessionUnsubscribeStub = jest.fn();
const organizationUnsubscribeStub = jest.fn();
const stateChangeUnsubscribeStub = jest.fn();

const mockStytchClient = {
  self: { getSync: jest.fn(), getInfo: jest.fn(), onChange: jest.fn() },
  session: {
    getSync: jest.fn(),
    getInfo: jest.fn(),
    onChange: jest.fn(),
  },
  organization: {
    getSync: jest.fn(),
    getInfo: jest.fn(),
    onChange: jest.fn(),
  },
  magicLinks: { authenticate: jest.fn() },
  rbac: { isAuthorizedSync: jest.fn(), isAuthorized: jest.fn(), allPermissions: jest.fn() },
  onStateChange: jest.fn(),
} satisfies PartialDeep<jest.Mocked<StytchB2BClient>>;

const testMember = {
  member_id: 'test-member-123',
};

const testSession = {
  expires_at: new Date(Date.now() + 10000).toUTCString(),
  member_session_id: 'test-session-123',
  roles: [],
};

const testOrganization = {
  organization_id: 'test-org-123',
};

const mockClientInfo = ({
  member,
  session,
  organization,
  fromCache,
}: {
  member: Partial<Member> | null;
  session: Partial<MemberSession> | null;
  organization: Partial<Organization> | null;
  fromCache: boolean;
}) => {
  mockStytchClient.self.getInfo.mockReturnValue({ member, fromCache });
  mockStytchClient.session.getInfo.mockReturnValue({ session, fromCache });
  mockStytchClient.organization.getInfo.mockReturnValue({ organization, fromCache });
};

describe('StytchContext', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockStytchClient.self.onChange.mockReturnValue(memberUnsubscribeStub);
    mockStytchClient.session.onChange.mockReturnValue(memberSessionUnsubscribeStub);
    mockStytchClient.organization.onChange.mockReturnValue(organizationUnsubscribeStub);
    mockStytchClient.onStateChange.mockReturnValue(stateChangeUnsubscribeStub);
  });

  const renderWithProvider = (
    ui: ReactElement,
    { stytch = mockStytchClient as unknown as StytchB2BClient, ...rest }: Partial<StytchB2BProviderProps> = {},
  ) =>
    render(
      <StytchB2BProvider stytch={stytch} {...rest}>
        {ui}
      </StytchB2BProvider>,
    );

  it('normal usage', async () => {
    const { unmount } = render(<StytchB2BProvider stytch={mockStytchClient as unknown as StytchB2BClient} />);

    expect(mockStytchClient.onStateChange).toHaveBeenCalled();
    expect(stateChangeUnsubscribeStub).not.toHaveBeenCalled();

    unmount();
    expect(stateChangeUnsubscribeStub).toHaveBeenCalled();
  });

  const UseStytchB2BClientTest = (): null => {
    const stytch = useStytchB2BClient();
    useEffect(() => {
      stytch.magicLinks.authenticate({ magic_links_token: 'use-stytch-test-token', session_duration_minutes: 1 });
    }, [stytch]);
    return null;
  };

  it('UseStytchB2BClientTest passes the Stytch client into the component', async () => {
    renderWithProvider(<UseStytchB2BClientTest />);
    expect(mockStytchClient.magicLinks.authenticate).toHaveBeenCalledWith({
      magic_links_token: 'use-stytch-test-token',
      session_duration_minutes: 1,
    });
  });

  const WithStytchB2BClientTest = withStytchB2BClient(({ stytch }) => {
    useEffect(() => {
      stytch.magicLinks.authenticate({ magic_links_token: 'use-stytch-test-token', session_duration_minutes: 1 });
    }, [stytch]);
    return null;
  });

  it('WithStytchB2BClientTest passes the Stytch client into the component', async () => {
    renderWithProvider(<WithStytchB2BClientTest />);
    expect(mockStytchClient.magicLinks.authenticate).toHaveBeenCalledWith({
      magic_links_token: 'use-stytch-test-token',
      session_duration_minutes: 1,
    });
  });

  const UseStytchMemberTest = (): null => {
    const member = useStytchMember();
    useEffect(() => {
      captureValue(member);
    }, [member]);
    return null;
  };

  it('useStytchMember passes the Stytch Member into the component', async () => {
    mockClientInfo({ member: testMember, session: null, organization: null, fromCache: true });
    renderWithProvider(<UseStytchMemberTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ fromCache: true, isInitialized: true, member: testMember });
    captureValue.mockClear();

    mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: false });
    renderWithProvider(<UseStytchMemberTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ fromCache: false, isInitialized: true, member: testMember });
  });

  it('supports assumeHydrated = false', async () => {
    mockClientInfo({ member: testMember, session: null, organization: null, fromCache: true });
    renderWithProvider(<UseStytchMemberTest />, { assumeHydrated: false });
    expect(captureValue).toHaveBeenCalledTimes(2);
    expect(captureValue).toHaveBeenNthCalledWith(1, { fromCache: false, isInitialized: false, member: null });
    expect(captureValue).toHaveBeenNthCalledWith(2, { fromCache: true, isInitialized: true, member: testMember });
    captureValue.mockClear();

    mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: false });
    renderWithProvider(<UseStytchMemberTest />, { assumeHydrated: false });
    expect(captureValue).toHaveBeenLastCalledWith({ fromCache: false, isInitialized: true, member: testMember });
  });

  const WithStytchMemberTest = withStytchMember(({ stytchMember, stytchMemberIsFromCache }): null => {
    useEffect(() => {
      captureValue({ stytchMember, stytchMemberIsFromCache });
    }, [stytchMember, stytchMemberIsFromCache]);
    return null;
  });

  it('withStytchMember passes the Stytch Member into the component', async () => {
    mockClientInfo({ member: testMember, session: null, organization: null, fromCache: true });
    renderWithProvider(<WithStytchMemberTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ stytchMemberIsFromCache: true, stytchMember: testMember });
    captureValue.mockClear();

    mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: false });
    renderWithProvider(<WithStytchMemberTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ stytchMemberIsFromCache: false, stytchMember: testMember });
  });

  const UseStytchMemberSessionTest = (): null => {
    const session = useStytchMemberSession();
    useEffect(() => {
      captureValue(session);
    }, [session]);
    return null;
  };

  it('useStytchMemberSession passes the Stytch Member Session into the component', async () => {
    mockClientInfo({ member: null, session: testSession, organization: null, fromCache: true });
    renderWithProvider(<UseStytchMemberSessionTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ fromCache: true, isInitialized: true, session: testSession });
    captureValue.mockClear();

    mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: false });
    renderWithProvider(<UseStytchMemberSessionTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ fromCache: false, isInitialized: true, session: testSession });
  });

  const WithStytchMemberSessionTest = withStytchMemberSession(
    ({ stytchMemberSession, stytchMemberSessionIsFromCache }): null => {
      useEffect(() => {
        captureValue({ stytchMemberSession, stytchMemberSessionIsFromCache });
      }, [stytchMemberSession, stytchMemberSessionIsFromCache]);
      return null;
    },
  );

  it('withStytchMemberSession passes the Stytch Session into the component', async () => {
    mockClientInfo({ member: null, session: testSession, organization: null, fromCache: true });
    renderWithProvider(<WithStytchMemberSessionTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({
      stytchMemberSession: testSession,
      stytchMemberSessionIsFromCache: true,
    });
    captureValue.mockClear();

    mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: false });
    renderWithProvider(<WithStytchMemberSessionTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({
      stytchMemberSession: testSession,
      stytchMemberSessionIsFromCache: false,
    });
  });

  const UseStytchOrganizationTest = (): null => {
    const organization = useStytchOrganization();
    useEffect(() => {
      captureValue(organization);
    }, [organization]);
    return null;
  };

  it('useStytchOrganization passes the Stytch Organization into the component', async () => {
    mockClientInfo({ member: null, session: null, organization: testOrganization, fromCache: true });
    renderWithProvider(<UseStytchOrganizationTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ fromCache: true, isInitialized: true, organization: testOrganization });
    captureValue.mockClear();

    mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: false });
    renderWithProvider(<UseStytchOrganizationTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({
      fromCache: false,
      isInitialized: true,
      organization: testOrganization,
    });
  });

  const WithStytchOrganizationTest = withStytchOrganization(
    ({ stytchOrganization, stytchOrganizationIsFromCache }): null => {
      useEffect(() => {
        captureValue({ stytchOrganization, stytchOrganizationIsFromCache });
      }, [stytchOrganization, stytchOrganizationIsFromCache]);
      return null;
    },
  );

  it('withStytchOrganization passes the Stytch Organization into the component', async () => {
    mockClientInfo({ member: null, session: null, organization: testOrganization, fromCache: true });
    renderWithProvider(<WithStytchOrganizationTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({
      stytchOrganization: testOrganization,
      stytchOrganizationIsFromCache: true,
    });
    captureValue.mockClear();

    mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: false });
    renderWithProvider(<WithStytchOrganizationTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({
      stytchOrganization: testOrganization,
      stytchOrganizationIsFromCache: false,
    });
  });

  const UseStytchIsAuthorizedTest = (): null => {
    const isAuthorized = useStytchIsAuthorized('documents', 'write');
    useEffect(() => {
      captureValue(isAuthorized);
    }, [isAuthorized]);
    return null;
  };

  it('useStytchIsAuthorized returns whether the member is authorized', async () => {
    mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: true });
    mockStytchClient.rbac.isAuthorizedSync.mockReturnValue(true);
    mockStytchClient.rbac.isAuthorized.mockResolvedValue(true);
    renderWithProvider(<UseStytchIsAuthorizedTest />);

    // Initial clientside render from cache
    expect(captureValue).toHaveBeenCalledWith({ fromCache: true, isInitialized: true, isAuthorized: true });

    // Subsequent render from refreshed data
    await waitFor(() => {
      expect(captureValue).toHaveBeenCalledWith({ fromCache: false, isInitialized: true, isAuthorized: true });
    });
  });

  const WithStytchPermissionsTest = withStytchPermissions(({ stytchPermissions }): null => {
    useEffect(() => {
      captureValue(stytchPermissions);
    }, [stytchPermissions]);
    return null;
  });

  it('withStytchPermissions passes the Stytch Permissions Manifest into the component', async () => {
    mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: true });
    mockStytchClient.rbac.allPermissions.mockResolvedValue({
      document: { read: true, write: false },
    });
    renderWithProvider(<WithStytchPermissionsTest />);
    await waitFor(() =>
      expect(captureValue).toHaveBeenCalledWith({
        document: { read: true, write: false },
      }),
    );
  });

  const LoginTest = (): null => {
    const memberReturn = useStytchMember();
    const sessionReturn = useStytchMemberSession();
    const organizationReturn = useStytchOrganization();
    const isAuthorizedReturn = useStytchIsAuthorized('documents', 'read');
    captureValue({ memberReturn, sessionReturn, organizationReturn, isAuthorizedReturn });
    return null;
  };

  it('Login and Logout events cause state changes inside the components', async () => {
    mockClientInfo({ member: null, session: null, organization: null, fromCache: true });
    mockStytchClient.rbac.isAuthorizedSync.mockReturnValue(false);
    mockStytchClient.rbac.isAuthorized.mockResolvedValue(false);

    type callback = (u: unknown) => null;

    const stateChangeListenerProm = new Promise<callback>((captureValue) =>
      mockStytchClient.onStateChange.mockImplementation((listener: callback) => {
        captureValue(listener);
        return stateChangeUnsubscribeStub;
      }),
    );

    // Initial render: nobody is logged in

    renderWithProvider(<LoginTest />);

    expect(captureValue).toHaveBeenLastCalledWith({
      memberReturn: { fromCache: true, isInitialized: true, member: null },
      sessionReturn: { fromCache: true, isInitialized: true, session: null },
      organizationReturn: { fromCache: true, isInitialized: true, organization: null },
      isAuthorizedReturn: { fromCache: true, isInitialized: true, isAuthorized: false },
    });

    captureValue.mockClear();

    const stateChangeListener = await stateChangeListenerProm;

    // A login event occurs, and a rerender follows

    await act(async () => {
      mockStytchClient.rbac.isAuthorized.mockResolvedValue(true);
      mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: false });
      stateChangeListener({ member: testMember, session: testSession, organization: testOrganization });
    });

    expect(captureValue).toHaveBeenLastCalledWith({
      memberReturn: { fromCache: false, isInitialized: true, member: testMember },
      sessionReturn: { fromCache: false, isInitialized: true, session: testSession },
      organizationReturn: { fromCache: false, isInitialized: true, organization: testOrganization },
      isAuthorizedReturn: { fromCache: false, isInitialized: true, isAuthorized: true },
    });

    captureValue.mockClear();

    // A logout event occurs, and a rerender follows

    await act(async () => {
      mockStytchClient.rbac.isAuthorized.mockResolvedValue(false);
      mockClientInfo({ member: null, session: null, organization: null, fromCache: false });
      stateChangeListener({ member: null, session: null, organization: null });
    });

    expect(captureValue).toHaveBeenLastCalledWith({
      memberReturn: { fromCache: false, isInitialized: true, member: null },
      sessionReturn: { fromCache: false, isInitialized: true, session: null },
      organizationReturn: { fromCache: false, isInitialized: true, organization: null },
      isAuthorizedReturn: { fromCache: false, isInitialized: true, isAuthorized: false },
    });
  });

  it('no provider errors', async () => {
    expectToThrow(() => render(<UseStytchB2BClientTest />), noProviderError('useStytchB2BClient', 'StytchB2BProvider'));
    expectToThrow(
      () => render(<WithStytchB2BClientTest />),
      noProviderError('withStytchB2BClient', 'StytchB2BProvider'),
    );
    expectToThrow(() => render(<UseStytchMemberTest />), noProviderError('useStytchMember', 'StytchB2BProvider'));
    expectToThrow(() => render(<WithStytchMemberTest />), noProviderError('withStytchMember', 'StytchB2BProvider'));
    expectToThrow(
      () => render(<UseStytchMemberSessionTest />),
      noProviderError('useStytchMemberSession', 'StytchB2BProvider'),
    );
    expectToThrow(
      () => render(<WithStytchMemberSessionTest />),
      noProviderError('withStytchMemberSession', 'StytchB2BProvider'),
    );
    expectToThrow(
      () => render(<UseStytchOrganizationTest />),
      noProviderError('useStytchOrganization', 'StytchB2BProvider'),
    );
    expectToThrow(
      () => render(<WithStytchOrganizationTest />),
      noProviderError('withStytchOrganization', 'StytchB2BProvider'),
    );
  });

  it('nested stytch context errors', async () => {
    expectToThrow(
      () =>
        render(
          <StytchB2BProvider stytch={mockStytchClient as unknown as StytchB2BClient}>
            <StytchB2BProvider stytch={mockStytchClient as unknown as StytchB2BClient} />
          </StytchB2BProvider>,
        ),
      'You cannot render a <StytchB2BProvider> inside another <StytchB2BProvider>.',
    );
  });
});
