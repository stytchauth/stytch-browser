import { Session, User } from '@stytch/core/public';
import { expectToThrow } from '@stytch/internal-test-utils';
import { StytchClient } from '@stytch/web/headless';
import { act, render, waitFor } from '@testing-library/react';
import React, { ReactElement, useEffect } from 'react';
import type { PartialDeep } from 'type-fest';

import {
  StytchProvider,
  StytchProviderProps,
  useStytch,
  useStytchIsAuthorized,
  useStytchSession,
  useStytchUser,
  withStytch,
  withStytchPermissions,
  withStytchSession,
  withStytchUser,
} from '.';

const captureValue = jest.fn();
const userUnsubscribeStub = jest.fn();
const sessionUnsubscribeStub = jest.fn();
const stateChangeUnsubscribeStub = jest.fn();

const mockStytchClient = {
  user: { getSync: jest.fn(), getInfo: jest.fn(), onChange: jest.fn() },
  session: { getSync: jest.fn(), getInfo: jest.fn(), onChange: jest.fn() },
  onStateChange: jest.fn(),
  magicLinks: { authenticate: jest.fn() },
  rbac: { isAuthorizedSync: jest.fn(), isAuthorized: jest.fn(), allPermissions: jest.fn() },
} satisfies PartialDeep<jest.Mocked<StytchClient>>;

const testUser = {
  user_id: 'test-user-123',
  roles: ['default'],
};

const testSession = {
  expires_at: new Date(Date.now() + 10000).toUTCString(),
  session_id: 'test-session-123',
};

const mockClientInfo = ({
  user,
  session,
  fromCache,
}: {
  user: Partial<User> | null;
  session: Partial<Session> | null;
  fromCache: boolean;
}) => {
  mockStytchClient.user.getInfo.mockReturnValue({ user, fromCache });
  mockStytchClient.session.getInfo.mockReturnValue({ session, fromCache });
};

describe('StytchContext', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockStytchClient.user.onChange.mockReturnValue(userUnsubscribeStub);
    mockStytchClient.session.onChange.mockReturnValue(sessionUnsubscribeStub);
    mockStytchClient.onStateChange.mockReturnValue(stateChangeUnsubscribeStub);
  });

  const renderWithProvider = (
    ui: ReactElement,
    { stytch = mockStytchClient as unknown as StytchClient, ...rest }: Partial<StytchProviderProps> = {},
  ) =>
    render(
      <StytchProvider stytch={stytch} {...rest}>
        {ui}
      </StytchProvider>,
    );

  it('normal usage', async () => {
    const { unmount } = render(<StytchProvider stytch={mockStytchClient as unknown as StytchClient} />);

    expect(mockStytchClient.onStateChange).toHaveBeenCalled();
    expect(stateChangeUnsubscribeStub).not.toHaveBeenCalled();

    unmount();
    expect(stateChangeUnsubscribeStub).toHaveBeenCalled();
  });

  const UseStytchTest = (): null => {
    const stytch = useStytch();
    useEffect(() => {
      stytch.magicLinks.authenticate('use-stytch-test-token', { session_duration_minutes: 1 });
    }, [stytch]);
    return null;
  };

  it('useStytch passes the Stytch client into the component', async () => {
    renderWithProvider(<UseStytchTest />);
    expect(mockStytchClient.magicLinks.authenticate).toHaveBeenCalledWith('use-stytch-test-token', {
      session_duration_minutes: 1,
    });
  });

  const WithStytchTest = withStytch(({ stytch }) => {
    useEffect(() => {
      stytch.magicLinks.authenticate('with-stytch-test-token', { session_duration_minutes: 1 });
    }, [stytch]);
    return null;
  });

  it('withStytch passes the Stytch client into the component', async () => {
    renderWithProvider(<WithStytchTest />);
    expect(mockStytchClient.magicLinks.authenticate).toHaveBeenCalledWith('with-stytch-test-token', {
      session_duration_minutes: 1,
    });
  });

  const UseStytchUserTest = (): null => {
    const user = useStytchUser();
    useEffect(() => {
      captureValue(user);
    }, [user]);
    return null;
  };

  it('useStytchUser passes the Stytch User into the component', async () => {
    mockClientInfo({ user: testUser, session: null, fromCache: true });
    renderWithProvider(<UseStytchUserTest />);
    expect(captureValue).toHaveBeenCalledTimes(2);
    expect(captureValue).toHaveBeenNthCalledWith(1, { fromCache: false, isInitialized: false, user: null });
    expect(captureValue).toHaveBeenNthCalledWith(2, { fromCache: true, isInitialized: true, user: testUser });
    captureValue.mockClear();

    mockClientInfo({ user: testUser, session: testSession, fromCache: false });
    renderWithProvider(<UseStytchUserTest />);
    expect(captureValue).toHaveBeenLastCalledWith({ fromCache: false, isInitialized: true, user: testUser });
  });

  it('supports assumeHydrated = true', async () => {
    mockClientInfo({ user: testUser, session: null, fromCache: true });
    renderWithProvider(<UseStytchUserTest />, { assumeHydrated: true });
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ fromCache: true, user: testUser, isInitialized: true });
    captureValue.mockClear();

    mockClientInfo({ user: testUser, session: testSession, fromCache: false });
    renderWithProvider(<UseStytchUserTest />, { assumeHydrated: true });
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ fromCache: false, user: testUser, isInitialized: true });
  });

  const WithStytchUserTest = withStytchUser(({ stytchUser, stytchUserIsFromCache, stytchUserIsInitialized }): null => {
    useEffect(() => {
      captureValue({ stytchUser, stytchUserIsFromCache, stytchUserIsInitialized });
    }, [stytchUser, stytchUserIsFromCache, stytchUserIsInitialized]);
    return null;
  });

  it('withStytchUser passes the Stytch User into the component', async () => {
    mockClientInfo({ user: testUser, session: null, fromCache: true });
    renderWithProvider(<WithStytchUserTest />);
    expect(captureValue).toHaveBeenCalledTimes(2);
    expect(captureValue).toHaveBeenNthCalledWith(1, {
      stytchUser: null,
      stytchUserIsFromCache: false,
      stytchUserIsInitialized: false,
    });
    expect(captureValue).toHaveBeenNthCalledWith(2, {
      stytchUser: testUser,
      stytchUserIsFromCache: true,
      stytchUserIsInitialized: true,
    });
    captureValue.mockClear();

    mockClientInfo({ user: testUser, session: testSession, fromCache: false });
    renderWithProvider(<WithStytchUserTest />);
    expect(captureValue).toHaveBeenLastCalledWith({
      stytchUser: testUser,
      stytchUserIsFromCache: false,
      stytchUserIsInitialized: true,
    });
  });

  const UseStytchSessionTest = (): null => {
    const session = useStytchSession();
    useEffect(() => {
      captureValue(session);
    }, [session]);
    return null;
  };

  it('useStytchSession passes the Stytch Session into the component', async () => {
    mockClientInfo({ user: null, session: testSession, fromCache: true });
    renderWithProvider(<UseStytchSessionTest />);

    expect(captureValue).toHaveBeenCalledTimes(2);
    expect(captureValue).toHaveBeenNthCalledWith(1, { fromCache: false, isInitialized: false, session: null });
    expect(captureValue).toHaveBeenNthCalledWith(2, { fromCache: true, isInitialized: true, session: testSession });

    mockClientInfo({ user: testUser, session: testSession, fromCache: false });
    renderWithProvider(<UseStytchSessionTest />);
    expect(captureValue).toHaveBeenLastCalledWith({ fromCache: false, isInitialized: true, session: testSession });
  });

  const WithStytchSessionTest = withStytchSession(
    ({ stytchSession, stytchSessionIsFromCache, stytchSessionIsInitialized }): null => {
      useEffect(() => {
        captureValue({ stytchSession, stytchSessionIsFromCache, stytchSessionIsInitialized });
      }, [stytchSession, stytchSessionIsFromCache, stytchSessionIsInitialized]);
      return null;
    },
  );

  it('withStytchSession passes the Stytch Session into the component', async () => {
    mockClientInfo({ user: null, session: testSession, fromCache: true });
    renderWithProvider(<WithStytchSessionTest />);
    expect(captureValue).toHaveBeenCalledTimes(2);
    expect(captureValue).toHaveBeenNthCalledWith(1, {
      stytchSession: null,
      stytchSessionIsFromCache: false,
      stytchSessionIsInitialized: false,
    });
    expect(captureValue).toHaveBeenNthCalledWith(2, {
      stytchSession: testSession,
      stytchSessionIsFromCache: true,
      stytchSessionIsInitialized: true,
    });
    captureValue.mockClear();

    mockClientInfo({ user: testUser, session: testSession, fromCache: false });
    renderWithProvider(<WithStytchSessionTest />);
    expect(captureValue).toHaveBeenLastCalledWith({
      stytchSession: testSession,
      stytchSessionIsFromCache: false,
      stytchSessionIsInitialized: true,
    });
  });

  const LoginTest = (): null => {
    const userReturn = useStytchUser();
    const sessionReturn = useStytchSession();
    captureValue({ userReturn, sessionReturn });
    return null;
  };

  it('Login and Logout events cause state changes inside the components', async () => {
    mockClientInfo({ user: null, session: null, fromCache: true });

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
      userReturn: { fromCache: true, isInitialized: true, user: null },
      sessionReturn: { fromCache: true, isInitialized: true, session: null },
    });

    captureValue.mockClear();

    const stateChangeListener = await stateChangeListenerProm;

    // A login event occurs, and a rerender follows

    act(() => {
      mockClientInfo({ user: testUser, session: testSession, fromCache: false });
      stateChangeListener!({ user: testUser, session: testSession });
    });

    expect(captureValue).toHaveBeenLastCalledWith({
      userReturn: { fromCache: false, isInitialized: true, user: testUser },
      sessionReturn: { fromCache: false, isInitialized: true, session: testSession },
    });

    captureValue.mockClear();

    // A logout event occurs, and a rerender follows

    act(() => {
      mockClientInfo({ user: null, session: null, fromCache: false });
      stateChangeListener!({ user: null, session: null });
    });

    expect(captureValue).toHaveBeenLastCalledWith({
      userReturn: { fromCache: false, isInitialized: true, user: null },
      sessionReturn: { fromCache: false, isInitialized: true, session: null },
    });
  });

  it('no provider errors', async () => {
    expectToThrow(() => render(<UseStytchTest />), 'useStytch can only be used inside <StytchProvider>.');
    expectToThrow(() => render(<WithStytchTest />), 'withStytch can only be used inside <StytchProvider>.');
    expectToThrow(() => render(<UseStytchUserTest />), 'useStytchUser can only be used inside <StytchProvider>.');
    expectToThrow(() => render(<WithStytchUserTest />), 'withStytchUser can only be used inside <StytchProvider>.');
    expectToThrow(() => render(<UseStytchSessionTest />), 'useStytchSession can only be used inside <StytchProvider>.');
    expectToThrow(
      () => render(<WithStytchSessionTest />),
      'withStytchSession can only be used inside <StytchProvider>.',
    );
  });

  const UseStytchIsAuthorizedTest = (): null => {
    const isAuthorized = useStytchIsAuthorized('documents', 'write');
    useEffect(() => {
      captureValue(isAuthorized);
    }, [isAuthorized]);
    return null;
  };

  it('useStytchIsAuthorized returns whether the user is authorized', async () => {
    mockClientInfo({ user: testUser, session: testSession, fromCache: true });
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
    mockClientInfo({ user: testUser, session: testSession, fromCache: true });
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
});
