import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { useOauthDiscoveryAuthenticate } from './useOauthDiscoveryAuthenticate';
import { StytchRNB2BUIConfig } from '../config';
import { MOCK_MEMBER_DISCOVERY_AUTH } from '../mocks';
import { MOCK_STYTCH_API_ERROR } from '../../../mocks';

describe('useOauthDiscoveryAuthenticate', () => {
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
        discovery: {
          authenticate: jest.fn().mockResolvedValue(MOCK_MEMBER_DISCOVERY_AUTH),
        },
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { oauthDiscoveryAuthenticate } = useOauthDiscoveryAuthenticate();
    await oauthDiscoveryAuthenticate('token');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'oauth/discovery/authenticate/success',
      response: MOCK_MEMBER_DISCOVERY_AUTH,
    });
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'discovery/setDiscoveredOrganizations',
      email: MOCK_MEMBER_DISCOVERY_AUTH.email_address,
      discoveredOrganizations: MOCK_MEMBER_DISCOVERY_AUTH.discovered_organizations,
    });
  });
  it('dispatches expected error when call fails', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const mockStytchClient = {
      oauth: {
        discovery: {
          authenticate: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
        },
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { oauthDiscoveryAuthenticate } = useOauthDiscoveryAuthenticate();
    await oauthDiscoveryAuthenticate('token');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'oauth/discovery/authenticate/error',
      error: { apiError: MOCK_STYTCH_API_ERROR },
    });
  });
});
