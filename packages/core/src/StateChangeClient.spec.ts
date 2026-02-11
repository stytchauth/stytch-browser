import { ConsumerState, Session, User } from './public';
import { StateChangeClient } from './StateChangeClient';
import { ISubscriptionService, SubscriptionService } from './SubscriptionService';
import { PUBLIC_TOKEN } from './testing';
import { MOCK_STORAGE_CLIENT } from './testing/mockStorageClient';
import { AllowedOpaqueTokens } from './typeConfig';

const emptyState = { session: undefined, user: undefined } as const satisfies ConsumerState;

describe('StateChangeClient', () => {
  let subscriptionService: ISubscriptionService<ConsumerState, AllowedOpaqueTokens>;

  beforeEach(() => {
    subscriptionService = new SubscriptionService<ConsumerState>(PUBLIC_TOKEN, MOCK_STORAGE_CLIENT);
  });

  it('should call the callback with the current state when updated', () => {
    const mockCallback = jest.fn();
    const stateChangeClient = new StateChangeClient(subscriptionService, emptyState);
    stateChangeClient.onStateChange(mockCallback);

    expect(mockCallback).not.toHaveBeenCalled();

    subscriptionService.updateState({
      user: { user_id: 'fake-user' } as User,
      session: { session_id: 'fake-session' } as Session,
    });

    expect(mockCallback).toHaveBeenCalledWith({
      user: { user_id: 'fake-user' } as User,
      session: { session_id: 'fake-session' } as Session,
    });
  });

  it('should call the callback with the empty state when the state is null', () => {
    const mockCallback = jest.fn();
    const stateChangeClient = new StateChangeClient(subscriptionService, emptyState);
    stateChangeClient.onStateChange(mockCallback);

    expect(mockCallback).not.toHaveBeenCalled();

    subscriptionService.updateStateAndTokens({
      state: null,
      intermediate_session_token: null,
      session_jwt: null,
      session_token: null,
    });

    expect(mockCallback).toHaveBeenCalledWith(emptyState);
  });

  it('should stop calling callback after being unsubscribed', () => {
    const mockCallback = jest.fn();
    const stateChangeClient = new StateChangeClient(subscriptionService, emptyState);
    const unsubscribe = stateChangeClient.onStateChange(mockCallback);

    expect(mockCallback).not.toHaveBeenCalled();

    subscriptionService.updateState({
      user: { user_id: 'fake-user' } as User,
      session: { session_id: 'fake-session' } as Session,
    });

    expect(mockCallback).toHaveBeenCalledWith({
      user: { user_id: 'fake-user' } as User,
      session: { session_id: 'fake-session' } as Session,
    });

    mockCallback.mockClear();

    unsubscribe();

    subscriptionService.updateState({
      user: { user_id: 'fake-user-2' } as User,
      session: { session_id: 'fake-session-2' } as Session,
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });
});
