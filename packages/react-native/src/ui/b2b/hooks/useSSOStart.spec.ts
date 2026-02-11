import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { useSSOStart } from './useSSOStart';
import { StytchRNB2BUIConfig } from '../config';
import { MOCK_STYTCH_API_ERROR } from '../../../mocks';

describe('useSSOStart', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchB2BClient;
    });
    jest.spyOn(ContextProvider, 'useConfig').mockImplementation(() => {
      return {
        productConfig: {
          sessionOptions: {},
        },
      } as StytchRNB2BUIConfig;
    });
    jest.spyOn(ContextProvider, 'useRedirectUrl').mockReturnValue('stytch-ui-something://deeplink');
    jest.spyOn(ContextProvider, 'useEventCallback').mockReturnValue(jest.fn());
  });
  it('dispatches expected success when call succeeds', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const mockStytchClient = {
      sso: {
        start: jest.fn().mockResolvedValue({}),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { ssoStart } = useSSOStart();
    await ssoStart('connection_id');
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'sso/start/success' });
  });
  it('dispatches expected error when call fails', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const mockStytchClient = {
      sso: {
        start: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { ssoStart } = useSSOStart();
    await ssoStart('connection_id');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'sso/start/error',
      error: { apiError: MOCK_STYTCH_API_ERROR },
    });
  });
});
