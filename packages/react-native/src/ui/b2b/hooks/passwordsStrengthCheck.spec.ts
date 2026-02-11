import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { usePasswordsStrengthCheck } from './passwordsStrengthCheck';

describe('passwordsStrengthCheck', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchB2BClient;
    });
  });
  describe('when missing a password', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            memberState: {
              ...DEFAULT_UI_STATE.memberState,
              emailAddress: {
                isValid: true,
                emailAddress: 'my@email.com',
                didFinish: true,
              },
            },
          },
          dispatchMock,
        ];
      });
      const { checkPasswordStrength } = usePasswordsStrengthCheck();
      await checkPasswordStrength();
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
            memberState: {
              ...DEFAULT_UI_STATE.memberState,
              emailAddress: {
                isValid: true,
                emailAddress: 'my@email.com',
                didFinish: true,
              },
              password: {
                ...DEFAULT_UI_STATE.memberState.password,
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
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchB2BClient);
      const { checkPasswordStrength } = usePasswordsStrengthCheck();
      await checkPasswordStrength();
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
            memberState: {
              ...DEFAULT_UI_STATE.memberState,
              emailAddress: {
                isValid: true,
                emailAddress: 'my@email.com',
                didFinish: true,
              },
              password: {
                ...DEFAULT_UI_STATE.memberState.password,
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
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchB2BClient);
      const { checkPasswordStrength } = usePasswordsStrengthCheck();
      await checkPasswordStrength();
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
            memberState: {
              ...DEFAULT_UI_STATE.memberState,
              emailAddress: {
                isValid: true,
                emailAddress: 'my@email.com',
                didFinish: true,
              },
              password: {
                ...DEFAULT_UI_STATE.memberState.password,
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
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchB2BClient);
      const { checkPasswordStrength } = usePasswordsStrengthCheck();
      await checkPasswordStrength();
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'passwords/strengthCheck/error',
        error: { apiError: MOCK_STYTCH_API_ERROR },
      });
    });
  });
});
