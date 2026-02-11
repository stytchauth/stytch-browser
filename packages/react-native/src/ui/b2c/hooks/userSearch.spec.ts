import * as ContextProvider from '../ContextProvider';
import { useUserSearch } from './userSearch';
import { DEFAULT_UI_STATE } from '../states';
import { StytchClient } from '../../../StytchClient';
import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { internalSymB2C } from '../../../internals';

describe('userSearch', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchClient;
    });
  });
  describe('when missing an email address', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const { searchForUser } = useUserSearch();
      await searchForUser();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'userSearch' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'userSearch/error',
        error: { internalError: 'Missing email address' },
      });
    });
  });
  describe('when an email address is present and search succeeds', () => {
    it('dispatches the expected success action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            userState: {
              ...DEFAULT_UI_STATE.userState,
              emailAddress: {
                isValid: true,
                emailAddress: 'my@email.com',
              },
            },
          },
          dispatchMock,
        ];
      });
      const mockStytchClient = {
        [internalSymB2C]: {
          search: {
            searchUser: jest.fn().mockResolvedValue({ userType: 'new' }),
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { searchForUser } = useUserSearch();
      await searchForUser();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'userSearch' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'userSearch/success', result: 'new' });
    });
  });
  describe('when an email address is present and search fails with a generic error', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            userState: {
              ...DEFAULT_UI_STATE.userState,
              emailAddress: {
                isValid: true,
                emailAddress: 'my@email.com',
              },
            },
          },
          dispatchMock,
        ];
      });
      const mockStytchClient = {
        [internalSymB2C]: {
          search: {
            searchUser: jest.fn().mockRejectedValue({ message: 'Something went wrong' }),
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { searchForUser } = useUserSearch();
      await searchForUser();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'userSearch' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'userSearch/error' });
    });
  });
  describe('when an email address is present and search fails with a StytchSDKAPI error', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            userState: {
              ...DEFAULT_UI_STATE.userState,
              emailAddress: {
                isValid: true,
                emailAddress: 'my@email.com',
              },
            },
          },
          dispatchMock,
        ];
      });
      const mockStytchClient = {
        [internalSymB2C]: {
          search: {
            searchUser: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { searchForUser } = useUserSearch();
      await searchForUser();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'userSearch' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'userSearch/error',
        error: { apiError: MOCK_STYTCH_API_ERROR },
      });
    });
  });
});
