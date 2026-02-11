import { Session, User } from '@stytch/core/public';
import { act, render } from '@testing-library/react-native';
import React, { ReactElement, useEffect } from 'react';
import { AppState } from 'react-native';
import type { PartialDeep } from 'type-fest';

import { StytchClient } from './StytchClient';
import {
  StytchProvider,
  StytchProviderProps,
  useStytch,
  useStytchSession,
  useStytchUser,
  withStytch,
  withStytchSession,
  withStytchUser,
} from './StytchContext';

const captureValue = jest.fn();
const userUnsubscribeStub = jest.fn();
const sessionUnsubscribeStub = jest.fn();
const removeEventListenerStub = jest.fn();
const stateChangeUnsubscribeStub = jest.fn();

const mockStytchClient = {
  user: { getSync: jest.fn(), getInfo: jest.fn(), onChange: jest.fn() },
  session: { getSync: jest.fn(), getInfo: jest.fn(), onChange: jest.fn() },
  onStateChange: jest.fn(),
  magicLinks: { authenticate: jest.fn() },
} satisfies PartialDeep<jest.Mocked<StytchClient>>;

const testUser = {
  user_id: 'test-user-123',
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
    jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: removeEventListenerStub });
    mockStytchClient.user.onChange.mockReturnValue(userUnsubscribeStub);
    mockStytchClient.session.onChange.mockReturnValue(sessionUnsubscribeStub);
    mockStytchClient.onStateChange.mockReturnValue(stateChangeUnsubscribeStub);
  });

  const renderWithProvider = (
    ui: ReactElement,
    stytch: StytchProviderProps['stytch'] = mockStytchClient as unknown as StytchClient,
  ) => render(<StytchProvider stytch={stytch}>{ui}</StytchProvider>);

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
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ fromCache: true, user: testUser });
    captureValue.mockClear();

    mockClientInfo({ user: testUser, session: testSession, fromCache: false });
    renderWithProvider(<UseStytchUserTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ fromCache: false, user: testUser });
  });

  const WithStytchUserTest = withStytchUser(({ stytchUser, stytchUserIsFromCache }): null => {
    useEffect(() => {
      captureValue({ stytchUser, stytchUserIsFromCache });
    }, [stytchUser, stytchUserIsFromCache]);
    return null;
  });

  it('withStytchUser passes the Stytch User into the component', async () => {
    mockClientInfo({ user: testUser, session: null, fromCache: true });
    renderWithProvider(<WithStytchUserTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ stytchUser: testUser, stytchUserIsFromCache: true });
    captureValue.mockClear();

    mockClientInfo({ user: testUser, session: testSession, fromCache: false });
    renderWithProvider(<WithStytchUserTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ stytchUser: testUser, stytchUserIsFromCache: false });
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
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ fromCache: true, session: testSession });
    captureValue.mockClear();

    mockClientInfo({ user: testUser, session: testSession, fromCache: false });
    renderWithProvider(<UseStytchSessionTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ fromCache: false, session: testSession });
  });

  const WithStytchSessionTest = withStytchSession(({ stytchSession, stytchSessionIsFromCache }): null => {
    useEffect(() => {
      captureValue({ stytchSession, stytchSessionIsFromCache });
    }, [stytchSession, stytchSessionIsFromCache]);
    return null;
  });

  it('withStytchSession passes the Stytch Session into the component', async () => {
    mockClientInfo({ user: null, session: testSession, fromCache: true });
    renderWithProvider(<WithStytchSessionTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ stytchSession: testSession, stytchSessionIsFromCache: true });
    captureValue.mockClear();

    mockClientInfo({ user: testUser, session: testSession, fromCache: false });
    renderWithProvider(<WithStytchSessionTest />);
    expect(captureValue).toHaveBeenCalledTimes(1);
    expect(captureValue).toHaveBeenCalledWith({ stytchSession: testSession, stytchSessionIsFromCache: false });
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
      userReturn: { fromCache: true, user: null },
      sessionReturn: { fromCache: true, session: null },
    });

    captureValue.mockClear();

    const stateChangeListener = await stateChangeListenerProm;

    // A login event occurs, and a rerender follows

    act(() => {
      mockClientInfo({ user: testUser, session: testSession, fromCache: false });
      stateChangeListener!({ user: testUser, session: testSession });
    });

    expect(captureValue).toHaveBeenLastCalledWith({
      userReturn: { fromCache: false, user: testUser },
      sessionReturn: { fromCache: false, session: testSession },
    });

    captureValue.mockClear();

    // A logout event occurs, and a rerender follows

    act(() => {
      mockClientInfo({ user: null, session: null, fromCache: false });
      stateChangeListener!({ user: null, session: null });
    });

    expect(captureValue).toHaveBeenLastCalledWith({
      userReturn: { fromCache: false, user: null },
      sessionReturn: { fromCache: false, session: null },
    });
  });
});
