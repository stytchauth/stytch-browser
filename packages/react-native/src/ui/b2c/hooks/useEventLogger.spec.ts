import * as ContextProvider from '../ContextProvider';
import { useEventLogger } from './useEventLogger';
import { StytchClient } from '../../../StytchClient';
import { internalSymB2C } from '../../../internals';
import { AnalyticsEvent } from '@stytch/core';
import { renderHook } from '@testing-library/react-native';

describe('useEventLogger', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchClient;
    });
  });
  it('passes the event to the event logger', async () => {
    const eventLogMock = jest.fn();
    const mockStytchClient = {
      [internalSymB2C]: {
        networkClient: {
          logEvent: eventLogMock,
        },
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchClient);
    const { result } = renderHook(() => useEventLogger());
    const event: AnalyticsEvent = {
      name: 'sdk_instance_instantiated',
      details: {
        event_callback_registered: false,
        error_callback_registered: false,
        success_callback_registered: false,
      },
    };
    result.current.logEvent(event);
    expect(eventLogMock).toHaveBeenCalledTimes(1);
    expect(eventLogMock).toHaveBeenLastCalledWith(event);
  });
});
