import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { StytchClient } from '../../../StytchClient';
import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { usePasswordsStrengthCheck } from './passwordsStrengthCheck';

describe('passwordsStrengthCheck', () => {
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
      const { checkPasswordStrength } = usePasswordsStrengthCheck();
      await checkPasswordStrength();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/strengthCheck' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'passwords/strengthCheck/error',
        error: { internalError: 'Missing email address' },
      });
    });
  });
  describe('when missing a password', () => {
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
      const { checkPasswordStrength } = usePasswordsStrengthCheck();
      await checkPasswordStrength();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/strengthCheck' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'passwords/strengthCheck/error',
        error: { internalError: 'Missing password' },
      });
    });
  });
  describe('when an email address and password is present and strengthCheck succeeds', () => {
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
              password: {
                ...DEFAULT_UI_STATE.userState.password,
                password: 'my cool password',
              },
            },
          },
          dispatchMock,
        ];
      });
      const mockStytchClient = {
        passwords: {
          strengthCheck: jest.fn().mockResolvedValue({}),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { checkPasswordStrength } = usePasswordsStrengthCheck();
      await checkPasswordStrength();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/strengthCheck' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'passwords/strengthCheck/success', response: {} });
    });
  });
  describe('when an email address and password is present and strengthCheck fails with a generic error', () => {
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
              password: {
                ...DEFAULT_UI_STATE.userState.password,
                password: 'my cool password',
              },
            },
          },
          dispatchMock,
        ];
      });
      const mockStytchClient = {
        passwords: {
          strengthCheck: jest.fn().mockRejectedValue({ message: 'Something went wrong' }),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { checkPasswordStrength } = usePasswordsStrengthCheck();
      await checkPasswordStrength();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/strengthCheck' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'passwords/strengthCheck/error' });
    });
  });
  describe('when an email address and password is present and strengthCheck fails with a StytchSDKAPI error', () => {
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
              password: {
                ...DEFAULT_UI_STATE.userState.password,
                password: 'my cool password',
              },
            },
          },
          dispatchMock,
        ];
      });
      const mockStytchClient = {
        passwords: {
          strengthCheck: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { checkPasswordStrength } = usePasswordsStrengthCheck();
      await checkPasswordStrength();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/strengthCheck' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'passwords/strengthCheck/error',
        error: { apiError: MOCK_STYTCH_API_ERROR },
      });
    });
  });
});
