import { OAuthProviders, RNUIProductConfig } from '@stytch/core/public';

import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { StytchClient } from '../../../StytchClient';
import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { useOAuthStart } from './oauthStart';
const eventLogMock = jest.fn();
jest.mock('./useEventLogger', () => ({
  useEventLogger: () => ({
    logEvent: eventLogMock,
  }),
}));
describe('oauthStart', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchClient;
    });
    jest.spyOn(ContextProvider, 'useConfig').mockImplementation(() => {
      return {
        oAuthOptions: {},
        sessionOptions: {},
      } as RNUIProductConfig;
    });
    jest.spyOn(ContextProvider, 'useRedirectUrl').mockReturnValue('stytch-ui-something://deeplink');
  });
  describe('calls the correct oauth provider start method', () => {
    it('Amazon', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          amazon: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Amazon });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('Google', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          google: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Google });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('Microsoft', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          microsoft: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Microsoft });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('Apple', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          apple: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Apple });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('Github', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          github: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Github });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('Gitlab', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          gitlab: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.GitLab });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('Facebook', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          facebook: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Facebook });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('Discord', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          discord: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Discord });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('Salesforce', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          salesforce: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Salesforce });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('Slack', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          slack: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Slack });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('Bitbucket', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          bitbucket: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Bitbucket });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('Linkedin', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          linkedin: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.LinkedIn });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('Coinbase', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          coinbase: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Coinbase });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('Twitch', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          twitch: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Twitch });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('Twitter', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          twitter: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Twitter });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('TikTok', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          tiktok: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.TikTok });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('Snapchat', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          snapchat: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Snapchat });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('Figma', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          figma: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Figma });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
    it('Yahoo', async () => {
      const startMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      const mockStytchClient = {
        oauth: {
          yahoo: {
            start: startMock,
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Yahoo });
      expect(startMock).toHaveBeenCalledTimes(1);
    });
  });
  describe('when start succeeds', () => {
    it('dispatches the expected success action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const mockStytchClient = {
        oauth: {
          amazon: {
            start: jest.fn().mockResolvedValue({}),
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Amazon });
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'oauth/start' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'oauth/start/success', response: {} });
    });
  });
  describe('when start fails with a generic error', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const mockStytchClient = {
        oauth: {
          amazon: {
            start: jest.fn().mockRejectedValue({ message: 'Something went wrong' }),
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Amazon });
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'oauth/start' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'oauth/start/error' });
    });
  });
  describe('when start fails with a StytchSDKAPI error', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const mockStytchClient = {
        oauth: {
          amazon: {
            start: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { startOAuthForProvider } = useOAuthStart();
      await startOAuthForProvider({ provider: OAuthProviders.Amazon });
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'oauth/start' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'oauth/start/error',
        error: { apiError: MOCK_STYTCH_API_ERROR },
      });
    });
  });
});
