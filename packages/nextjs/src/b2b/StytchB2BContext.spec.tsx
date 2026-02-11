import { expectToThrow } from '@stytch/internal-test-utils';
import { act, render, waitFor } from '@testing-library/react';
import React, { ReactElement, useEffect } from 'react';
import type { PartialDeep } from 'type-fest';

import {
  Member,
  MemberSession,
  Organization,
  StytchB2BClient,
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
} from '.';

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
    expect(captureValue).toHaveBeenCalledTimes(2);
    expect(captureValue).toHaveBeenNthCalledWith(1, { fromCache: false, isInitialized: false, member: null });
    expect(captureValue).toHaveBeenNthCalledWith(2, { fromCache: true, isInitialized: true, member: testMember });
    captureValue.mockClear();

    mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: false });
    renderWithProvider(<UseStytchMemberTest />);
    expect(captureValue).toHaveBeenLastCalledWith({ fromCache: false, isInitialized: true, member: testMember });
  });

  it('supports assumeHydrated = true', async () => {
    mockClientInfo({ member: testMember, session: null, organization: null, fromCache: true });
    renderWithProvider(<UseStytchMemberTest />, { assumeHydrated: true });
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ fromCache: true, isInitialized: true, member: testMember });
    captureValue.mockClear();

    mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: false });
    renderWithProvider(<UseStytchMemberTest />, { assumeHydrated: true });
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ fromCache: false, isInitialized: true, member: testMember });
  });

  const WithStytchMemberTest = withStytchMember(
    ({ stytchMember, stytchMemberIsFromCache, stytchMemberIsInitialized }): null => {
      useEffect(() => {
        captureValue({ stytchMember, stytchMemberIsFromCache, stytchMemberIsInitialized });
      }, [stytchMember, stytchMemberIsFromCache, stytchMemberIsInitialized]);
      return null;
    },
  );

  it('withStytchMember passes the Stytch Member into the component', async () => {
    mockClientInfo({ member: testMember, session: null, organization: null, fromCache: true });
    renderWithProvider(<WithStytchMemberTest />);
    expect(captureValue).toHaveBeenCalledTimes(2);
    expect(captureValue).toHaveBeenNthCalledWith(1, {
      stytchMemberIsFromCache: false,
      stytchMember: null,
      stytchMemberIsInitialized: false,
    });
    expect(captureValue).toHaveBeenNthCalledWith(2, {
      stytchMemberIsFromCache: true,
      stytchMember: testMember,
      stytchMemberIsInitialized: true,
    });
    captureValue.mockClear();

    mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: false });
    renderWithProvider(<WithStytchMemberTest />);
    expect(captureValue).toHaveBeenLastCalledWith({
      stytchMemberIsFromCache: false,
      stytchMember: testMember,
      stytchMemberIsInitialized: true,
    });
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
    expect(captureValue).toHaveBeenCalledTimes(2);
    expect(captureValue).toHaveBeenNthCalledWith(1, { fromCache: false, isInitialized: false, session: null });
    expect(captureValue).toHaveBeenNthCalledWith(2, { fromCache: true, isInitialized: true, session: testSession });
    captureValue.mockClear();

    mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: false });
    renderWithProvider(<UseStytchMemberSessionTest />);
    expect(captureValue).toHaveBeenLastCalledWith({ fromCache: false, isInitialized: true, session: testSession });
  });

  const WithStytchMemberSessionTest = withStytchMemberSession(
    ({ stytchMemberSession, stytchMemberSessionIsFromCache, stytchMemberSessionIsInitialized }): null => {
      useEffect(() => {
        captureValue({ stytchMemberSession, stytchMemberSessionIsFromCache, stytchMemberSessionIsInitialized });
      }, [stytchMemberSession, stytchMemberSessionIsFromCache, stytchMemberSessionIsInitialized]);
      return null;
    },
  );

  it('withStytchMemberSession passes the Stytch Session into the component', async () => {
    mockClientInfo({ member: null, session: testSession, organization: null, fromCache: true });
    renderWithProvider(<WithStytchMemberSessionTest />);
    expect(captureValue).toHaveBeenCalledTimes(2);
    expect(captureValue).toHaveBeenNthCalledWith(1, {
      stytchMemberSession: null,
      stytchMemberSessionIsFromCache: false,
      stytchMemberSessionIsInitialized: false,
    });
    expect(captureValue).toHaveBeenNthCalledWith(2, {
      stytchMemberSession: testSession,
      stytchMemberSessionIsFromCache: true,
      stytchMemberSessionIsInitialized: true,
    });
    captureValue.mockClear();

    mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: false });
    renderWithProvider(<WithStytchMemberSessionTest />);
    expect(captureValue).toHaveBeenLastCalledWith({
      stytchMemberSession: testSession,
      stytchMemberSessionIsFromCache: false,
      stytchMemberSessionIsInitialized: true,
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
    expect(captureValue).toHaveBeenCalledTimes(2);
    expect(captureValue).toHaveBeenNthCalledWith(1, {
      fromCache: false,
      isInitialized: false,
      organization: null,
    });
    expect(captureValue).toHaveBeenNthCalledWith(2, {
      fromCache: true,
      isInitialized: true,
      organization: testOrganization,
    });
    captureValue.mockClear();

    mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: false });
    renderWithProvider(<UseStytchOrganizationTest />);
    expect(captureValue).toHaveBeenLastCalledWith({
      fromCache: false,
      isInitialized: true,
      organization: testOrganization,
    });
  });

  const WithStytchOrganizationTest = withStytchOrganization(
    ({ stytchOrganization, stytchOrganizationIsFromCache, stytchOrganizationIsInitialized }): null => {
      useEffect(() => {
        captureValue({ stytchOrganization, stytchOrganizationIsFromCache, stytchOrganizationIsInitialized });
      }, [stytchOrganization, stytchOrganizationIsFromCache, stytchOrganizationIsInitialized]);
      return null;
    },
  );

  it('withStytchOrganization passes the Stytch Organization into the component', async () => {
    mockClientInfo({ member: null, session: null, organization: testOrganization, fromCache: true });
    renderWithProvider(<WithStytchOrganizationTest />);
    expect(captureValue).toHaveBeenCalledTimes(2);
    expect(captureValue).toHaveBeenNthCalledWith(1, {
      stytchOrganization: null,
      stytchOrganizationIsFromCache: false,
      stytchOrganizationIsInitialized: false,
    });
    expect(captureValue).toHaveBeenNthCalledWith(2, {
      stytchOrganization: testOrganization,
      stytchOrganizationIsFromCache: true,
      stytchOrganizationIsInitialized: true,
    });
    captureValue.mockClear();

    mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: false });
    renderWithProvider(<WithStytchOrganizationTest />);
    expect(captureValue).toHaveBeenLastCalledWith({
      stytchOrganization: testOrganization,
      stytchOrganizationIsFromCache: false,
      stytchOrganizationIsInitialized: true,
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
    // Initial serverside render
    expect(captureValue).toHaveBeenCalledWith({ fromCache: false, isAuthorized: false, isInitialized: false });

    // First useEffect - first clientside render
    await waitFor(() => {
      expect(captureValue).toHaveBeenCalledWith({ fromCache: true, isAuthorized: true, isInitialized: true });
    });

    // Second useEffect - refreshed clientside render
    await waitFor(() => {
      expect(captureValue).toHaveBeenCalledWith({ fromCache: false, isAuthorized: true, isInitialized: true });
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

    expect(captureValue).toHaveBeenCalledWith({
      memberReturn: { fromCache: false, isInitialized: false, member: null },
      sessionReturn: { fromCache: false, isInitialized: false, session: null },
      organizationReturn: { fromCache: false, isInitialized: false, organization: null },
      isAuthorizedReturn: { fromCache: false, isInitialized: false, isAuthorized: false },
    });

    captureValue.mockClear();

    const stateChangeListener = await stateChangeListenerProm;

    // A login event occurs, and a rerender follows

    await act(async () => {
      mockStytchClient.rbac.isAuthorized.mockResolvedValue(true);
      mockClientInfo({ member: testMember, session: testSession, organization: testOrganization, fromCache: false });
      stateChangeListener({ member: testMember, session: testSession, organization: testOrganization });
    });

    expect(captureValue).toHaveBeenCalledWith({
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

    expect(captureValue).toHaveBeenCalledWith({
      memberReturn: { fromCache: false, isInitialized: true, member: null },
      sessionReturn: { fromCache: false, isInitialized: true, session: null },
      organizationReturn: { fromCache: false, isInitialized: true, organization: null },
      isAuthorizedReturn: { fromCache: false, isInitialized: true, isAuthorized: false },
    });
  });

  it('no provider errors', async () => {
    expectToThrow(
      () => render(<UseStytchB2BClientTest />),
      'useStytchB2BClient can only be used inside <StytchB2BProvider>.',
    );
    expectToThrow(
      () => render(<WithStytchB2BClientTest />),
      'withStytchB2BClient can only be used inside <StytchB2BProvider>.',
    );
    expectToThrow(
      () => render(<UseStytchMemberTest />),
      'useStytchMember can only be used inside <StytchB2BProvider>.',
    );
    expectToThrow(
      () => render(<WithStytchMemberTest />),
      'withStytchMember can only be used inside <StytchB2BProvider>.',
    );
    expectToThrow(
      () => render(<UseStytchMemberSessionTest />),
      'useStytchMemberSession can only be used inside <StytchB2BProvider>.',
    );
    expectToThrow(
      () => render(<WithStytchMemberSessionTest />),
      'withStytchMemberSession can only be used inside <StytchB2BProvider>.',
    );
    expectToThrow(
      () => render(<UseStytchOrganizationTest />),
      'useStytchOrganization can only be used inside <StytchB2BProvider>.',
    );
    expectToThrow(
      () => render(<WithStytchOrganizationTest />),
      'withStytchOrganization can only be used inside <StytchB2BProvider>.',
    );
  });
});
