import { AnalyticsEvent } from '@stytch/core';
import { renderHook } from '@testing-library/react-native';

import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { internalSymB2B } from '../../../internals';
import * as ContextProvider from '../ContextProvider';
import { useEventLogger } from './useEventLogger';

describe('useEventLogger', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchB2BClient;
    });
  });
  it('passes the event to the event logger', async () => {
    const eventLogMock = jest.fn();
    const mockStytchClient = {
      [internalSymB2B]: {
        networkClient: {
          logEvent: eventLogMock,
        },
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
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
