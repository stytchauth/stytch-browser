import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { useOauthAuthenticate } from './useOauthAuthenticate';
import { StytchRNB2BUIConfig } from '../config';
import { MOCK_MEMBER_NEEDS_MFA } from '../mocks';
import { MOCK_STYTCH_API_ERROR } from '../../../mocks';

describe('useOauthAuthenticate', () => {
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
  it('dispatches expected success when call succeeds', async () => {
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
    const { oauthAuthenticate } = useOauthAuthenticate();
    await oauthAuthenticate('token');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'oauth/authenticate/success',
      response: MOCK_MEMBER_NEEDS_MFA,
    });
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'mfa/primaryAuthenticate/success',
      response: MOCK_MEMBER_NEEDS_MFA,
      includedMfaMethods: undefined,
    });
  });
  it('dispatches expected error when call fails', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const mockStytchClient = {
      oauth: {
        authenticate: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { oauthAuthenticate } = useOauthAuthenticate();
    await oauthAuthenticate('token');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'oauth/authenticate/error',
      error: { apiError: MOCK_STYTCH_API_ERROR },
    });
  });
});
