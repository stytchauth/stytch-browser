import { RNUIProductConfig } from '@stytch/core/public';

import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { StytchClient } from '../../../StytchClient';
import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { usePasswordsResetByEmailStart } from './passwordsResetByEmailStart';

describe('passwordsResetByEmailStart', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchClient;
    });
    jest.spyOn(ContextProvider, 'useConfig').mockImplementation(() => {
      return {
        passwordOptions: {},
      } as RNUIProductConfig;
    });
    jest.spyOn(ContextProvider, 'useRedirectUrl').mockReturnValue('stytch-ui-something://deeplink');
  });
  describe('when missing an email address', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const { resetPasswordByEmailStart } = usePasswordsResetByEmailStart();
      await resetPasswordByEmailStart('forgot');
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/resetByEmailStart', resetType: 'forgot' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'passwords/resetByEmailStart/error',
        error: { internalError: 'Missing email address' },
      });
    });
  });
  describe('when an email address is present and resetByEmailStart succeeds', () => {
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
        passwords: {
          resetByEmailStart: jest.fn().mockResolvedValue({}),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { resetPasswordByEmailStart } = usePasswordsResetByEmailStart();
      await resetPasswordByEmailStart('forgot');
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/resetByEmailStart', resetType: 'forgot' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'passwords/resetByEmailStart/success', response: {} });
    });
  });
  describe('when an email address is present and resetByEmailStart fails with a generic error', () => {
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
        passwords: {
          resetByEmailStart: jest.fn().mockRejectedValue({ message: 'Something went wrong' }),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { resetPasswordByEmailStart } = usePasswordsResetByEmailStart();
      await resetPasswordByEmailStart('forgot');
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/resetByEmailStart', resetType: 'forgot' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'passwords/resetByEmailStart/error' });
    });
  });
  describe('when an email address is present and resetByEmailStart fails with a StytchSDKAPI error', () => {
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
        passwords: {
          resetByEmailStart: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { resetPasswordByEmailStart } = usePasswordsResetByEmailStart();
      await resetPasswordByEmailStart('forgot');
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/resetByEmailStart', resetType: 'forgot' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'passwords/resetByEmailStart/error',
        error: { apiError: MOCK_STYTCH_API_ERROR },
      });
    });
  });
});
