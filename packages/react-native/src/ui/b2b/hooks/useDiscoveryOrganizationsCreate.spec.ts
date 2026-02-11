import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { useDiscoveryOrganizationsCreate } from './useDiscoveryOrganizationsCreate';
import { StytchRNB2BUIConfig } from '../config';
import { MOCK_MEMBER_NEEDS_MFA } from '../mocks';
import { MOCK_STYTCH_API_ERROR } from '../../../mocks';

describe('useDiscoveryOrganizationsCreate', () => {
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
      discovery: {
        organizations: {
          create: jest.fn().mockResolvedValue(MOCK_MEMBER_NEEDS_MFA),
        },
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { discoveryOrganizationsCreate } = useDiscoveryOrganizationsCreate();
    await discoveryOrganizationsCreate();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'discovery/organizations/create/success',
      response: MOCK_MEMBER_NEEDS_MFA,
    });
  });
  it('dispatches expected error when call fails', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const mockStytchClient = {
      discovery: {
        organizations: {
          create: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
        },
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { discoveryOrganizationsCreate } = useDiscoveryOrganizationsCreate();
    await discoveryOrganizationsCreate();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'discovery/organizations/create/error',
      error: { apiError: MOCK_STYTCH_API_ERROR },
    });
  });
});
