import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { StytchClient } from '../../../StytchClient';
import { useDeeplinkParser } from './useDeeplinkParser';
import { RNUIProductConfig, StytchSDKError } from '@stytch/core/public';
import { MOCK_STYTCH_API_ERROR, MOCK_AUTHENTICATE_RETURN_VALUE } from '../../../mocks';
const eventLogMock = jest.fn();
jest.mock('./useEventLogger', () => ({
  useEventLogger: () => ({
    logEvent: eventLogMock,
  }),
}));
jest.mock('react-native-url-polyfill/auto', () => {
  return {};
});

describe('useDeeplinkParser', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchClient;
    });
    jest.spyOn(ContextProvider, 'useConfig').mockImplementation(() => {
      return {
        sessionOptions: {},
      } as RNUIProductConfig;
    });
  });
  it('dispatches appropriate error when no token is found', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const mockStytchClient = {} as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchClient);
    const { parseDeeplink } = useDeeplinkParser();
    await parseDeeplink('host://deeplink');
    expect(dispatchMock).toHaveBeenCalledTimes(2);
    expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'deeplink/parse' });
    expect(dispatchMock).toHaveBeenLastCalledWith({
      type: 'deeplink/parse/error',
      error: { internalError: 'Unable to parse deeplink' },
    });
    expect(eventLogMock).toHaveBeenCalledWith({ name: 'deeplink_handled_failure', details: { error: undefined } });
  });
  describe('for magic_links', () => {
    it('dispatches expected error when authenticate call fails', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const mockStytchClient = {
        magicLinks: {
          authenticate: jest.fn().mockRejectedValue(new StytchSDKError('TestSDKError', 'This is a test SDKError')),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchClient);
      const { parseDeeplink } = useDeeplinkParser();
      await parseDeeplink('host://deeplink?stytch_token_type=magic_links&token=my_token');
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'deeplink/parse' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'deeplink/parse/error',
        error: { sdkError: new StytchSDKError('TestSDKError', 'This is a test SDKError') },
      });
      expect(eventLogMock).toHaveBeenCalledWith({
        name: 'deeplink_handled_failure',
        details: { error: new StytchSDKError('TestSDKError', 'This is a test SDKError') },
      });
    });
    it('dispatches expected success when authenticate call succeeds', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const mockStytchClient = {
        magicLinks: {
          authenticate: jest.fn().mockResolvedValue(MOCK_AUTHENTICATE_RETURN_VALUE),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchClient);
      const { parseDeeplink } = useDeeplinkParser();
      await parseDeeplink('host://deeplink?stytch_token_type=magic_links&token=my_token');
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'deeplink/parse' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'deeplink/parse/success',
        tokenType: 'magic_links',
        token: 'my_token',
      });
      expect(eventLogMock).toHaveBeenCalledWith({
        name: 'deeplink_handled_success',
        details: { token_type: 'magic_links' },
      });
    });
  });
  describe('for oauth', () => {
    it('dispatches expected error when authenticate call fails', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const mockStytchClient = {
        oauth: {
          authenticate: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchClient);
      const { parseDeeplink } = useDeeplinkParser();
      await parseDeeplink('host://deeplink?stytch_token_type=oauth&token=my_token');
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'deeplink/parse' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'deeplink/parse/error',
        error: { apiError: MOCK_STYTCH_API_ERROR },
      });
      expect(eventLogMock).toHaveBeenCalledWith({
        name: 'deeplink_handled_failure',
        details: { error: MOCK_STYTCH_API_ERROR },
      });
    });
    it('dispatches expected success when authenticate call succeeds', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const mockStytchClient = {
        oauth: {
          authenticate: jest.fn().mockResolvedValue(MOCK_AUTHENTICATE_RETURN_VALUE),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchClient);
      const { parseDeeplink } = useDeeplinkParser();
      await parseDeeplink('host://deeplink?stytch_token_type=oauth&token=my_token');
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'deeplink/parse' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'deeplink/parse/success',
        tokenType: 'oauth',
        token: 'my_token',
      });
      expect(eventLogMock).toHaveBeenCalledWith({ name: 'deeplink_handled_success', details: { token_type: 'oauth' } });
    });
  });
  describe('for password_reset', () => {
    it('dispatches expected success', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const { parseDeeplink } = useDeeplinkParser();
      await parseDeeplink('host://deeplink?stytch_token_type=reset_password&token=my_token');
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'deeplink/parse' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'deeplink/parse/success',
        tokenType: 'reset_password',
        token: 'my_token',
      });
    });
  });
  describe('for unknown types', () => {
    it('dispatches expected ignore', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const { parseDeeplink } = useDeeplinkParser();
      await parseDeeplink('host://deeplink?stytch_token_type=something_weird&token=my_token');
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'deeplink/parse' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'deeplink/parse/ignored' });
    });
  });
});
