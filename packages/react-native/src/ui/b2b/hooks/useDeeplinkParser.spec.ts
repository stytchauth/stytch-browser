import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { StytchRNB2BUIConfig } from '../config';
import * as ContextProvider from '../ContextProvider';
import { MOCK_MEMBER_DISCOVERY_AUTH, MOCK_MEMBER_NEEDS_MFA } from '../mocks';
import { DEFAULT_UI_STATE } from '../states';
import { useDeeplinkParser } from './useDeeplinkParser';
const eventLogMock = jest.fn();
jest.mock('./useEventLogger', () => ({
  useEventLogger: () => ({
    logEvent: eventLogMock,
  }),
}));
jest.mock('react-native-url-polyfill/auto', () => {
  return {};
});
jest.mock('./useConsoleLogger', () => {
  return {
    useConsoleLogger: () => ({
      consoleLog: jest.fn(),
    }),
  };
});

describe('useDeeplinkParser', () => {
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
    jest.spyOn(ContextProvider, 'useEventCallback').mockReturnValue(jest.fn());
  });
  it('dispatches appropriate error when no token is found', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const mockStytchClient = {} as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { parseDeeplink } = useDeeplinkParser();
    await parseDeeplink('host://deeplink');

    expect(dispatchMock).toHaveBeenCalledWith({ type: 'deeplink/parse', url: 'host://deeplink' });
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'deeplink/parse/error',
      error: { internalError: 'Unable to parse deeplink' },
    });
    expect(eventLogMock).toHaveBeenCalledWith({ name: 'deeplink_handled_failure', details: { error: undefined } });
  });
  describe('for discovery', () => {
    it('dispatches expected success when authenticate call succeeds', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const mockStytchClient = {
        magicLinks: {
          discovery: {
            authenticate: jest.fn().mockResolvedValue(MOCK_MEMBER_DISCOVERY_AUTH),
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
      const { parseDeeplink } = useDeeplinkParser();
      await parseDeeplink('host://deeplink?stytch_token_type=discovery&token=my_token');
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'deeplink/parse',
        url: 'host://deeplink?stytch_token_type=discovery&token=my_token',
      });
      expect(dispatchMock).toHaveBeenCalledWith({ type: 'deeplink/parse/success' });
    });
  });
  describe('for discovery oauth', () => {
    it('dispatches expected success when authenticate call succeeds', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const mockStytchClient = {
        oauth: {
          discovery: {
            authenticate: jest.fn().mockResolvedValue(MOCK_MEMBER_DISCOVERY_AUTH),
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
      const { parseDeeplink } = useDeeplinkParser();
      await parseDeeplink('host://deeplink?stytch_token_type=discovery_oauth&token=my_token');
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'deeplink/parse',
        url: 'host://deeplink?stytch_token_type=discovery_oauth&token=my_token',
      });
      expect(dispatchMock).toHaveBeenCalledWith({ type: 'deeplink/parse/success' });
    });
  });
  describe('for sso', () => {
    it('dispatches expected success when authenticate call succeeds', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const mockStytchClient = {
        sso: {
          authenticate: jest.fn().mockResolvedValue(MOCK_MEMBER_NEEDS_MFA),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
      const { parseDeeplink } = useDeeplinkParser();
      await parseDeeplink('host://deeplink?stytch_token_type=sso&token=my_token');
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'deeplink/parse',
        url: 'host://deeplink?stytch_token_type=sso&token=my_token',
      });
      expect(dispatchMock).toHaveBeenCalledWith({ type: 'deeplink/parse/success' });
    });
  });
  describe('for multi_tenant_magic_links', () => {
    it('dispatches expected success when authenticate call succeeds', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const mockStytchClient = {
        magicLinks: {
          authenticate: jest.fn().mockResolvedValue(MOCK_MEMBER_NEEDS_MFA),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
      const { parseDeeplink } = useDeeplinkParser();
      await parseDeeplink('host://deeplink?stytch_token_type=multi_tenant_magic_links&token=my_token');
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'deeplink/parse',
        url: 'host://deeplink?stytch_token_type=multi_tenant_magic_links&token=my_token',
      });
      expect(dispatchMock).toHaveBeenCalledWith({ type: 'deeplink/parse/success' });
    });
  });
  describe('for oauth', () => {
    it('dispatches expected success when authenticate call succeeds', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const mockStytchClient = {
        oauth: {
          authenticate: jest.fn().mockResolvedValue(MOCK_MEMBER_NEEDS_MFA),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
      const { parseDeeplink } = useDeeplinkParser();
      await parseDeeplink('host://deeplink?stytch_token_type=oauth&token=my_token');
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'deeplink/parse',
        url: 'host://deeplink?stytch_token_type=oauth&token=my_token',
      });
      expect(dispatchMock).toHaveBeenCalledWith({ type: 'deeplink/parse/success' });
    });
  });
  describe('for password_reset', () => {
    it('dispatches expected success', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const { parseDeeplink } = useDeeplinkParser();
      await parseDeeplink('host://deeplink?stytch_token_type=multi_tenant_passwords&token=my_token');

      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'deeplink/parse',
        url: 'host://deeplink?stytch_token_type=multi_tenant_passwords&token=my_token',
      });
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'passwords/resetPassword',
        token: 'my_token',
        tokenType: 'multi_tenant_passwords',
      });
    });
  });
  describe('for discovery password reset', () => {
    it('dispatches expected success', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const { parseDeeplink } = useDeeplinkParser();
      await parseDeeplink(
        'host://deeplink?stytch_token_type=discovery&token=my_token&stytch_redirect_type=reset_password',
      );

      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'deeplink/parse',
        url: 'host://deeplink?stytch_token_type=discovery&token=my_token&stytch_redirect_type=reset_password',
      });
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'passwords/resetPassword',
        token: 'my_token',
        tokenType: 'discovery',
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

      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'deeplink/parse',
        url: 'host://deeplink?stytch_token_type=something_weird&token=my_token',
      });
      expect(dispatchMock).toHaveBeenCalledWith({ type: 'deeplink/parse/ignored' });
    });
  });
});
