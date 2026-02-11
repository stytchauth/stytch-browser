import { BootstrapData } from '@stytch/core';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { EmitterSubscription, Linking } from 'react-native';

import { Platform } from '../../native-module/types';
import { StytchClient } from '../../StytchClient';
import { StytchTheme } from '../shared/config';
import { DEFAULT_UI_CONFIG } from './config';
import * as ContextProvider from './ContextProvider';
import { useDeeplinkParser } from './hooks/useDeeplinkParser';
import { Screen } from './screens';
import { DEFAULT_UI_STATE } from './states';
import { StytchUIContainer } from './StytchUIContainer';

jest.mock('react-native-country-codes-picker', () => {
  return {
    CountryPicker: jest.fn(),
  };
});
jest.mock('react-native-url-polyfill/auto', () => {
  return {};
});
jest.mock('../../native-module', function () {
  return {
    __esModule: true,
    default: class {
      DeviceInfo = {
        get: jest.fn().mockReturnValue({ platform: Platform.Android }),
      };
      Storage = {
        didMigrate: jest.fn().mockResolvedValue(true),
      };
    },
  };
});

jest.mock('./hooks/useDeeplinkParser');
const useDeeplinkParserMock = jest.mocked(useDeeplinkParser);

const listeners: { event: any; handler: any }[] = [];

describe('StytchUIContainer', () => {
  beforeAll(() => {
    Linking.addEventListener = jest.fn((event, handler) => {
      listeners.push({ event, handler });

      // Unused
      return null as unknown as EmitterSubscription;
    });

    Linking.emit = jest.fn((event, props) => {
      listeners.filter((l) => l.event === event).forEach((l) => l.handler(props));
    });

    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchClient;
    });
    jest.spyOn(ContextProvider, 'useTheme').mockImplementation(() => {
      return {} as StytchTheme;
    });
    jest.spyOn(ContextProvider, 'useConfig').mockImplementation(() => {
      return DEFAULT_UI_CONFIG.productConfig;
    });
    jest.spyOn(ContextProvider, 'useBootStrapData').mockImplementation(() => {
      return {} as BootstrapData;
    });
    jest.spyOn(ContextProvider, 'usePlatform').mockImplementation(() => {
      return Platform.Android;
    });
    jest.spyOn(ContextProvider, 'useRedirectUrl').mockReturnValue('stytch-ui-something://deeplink');
    useDeeplinkParserMock.mockReturnValue({
      parseDeeplink: jest.fn(),
    });
  });
  describe('given a particular screen', () => {
    it('shows the MainScreen (and no others)', () => {
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, jest.fn()];
      });
      render(<StytchUIContainer />);
      expect(screen.getByTestId('MainScreen')).toBeTruthy();
      expect(screen.queryByTestId('OTPConfirmationScreen')).toBeFalsy();
      expect(screen.queryByTestId('EMLConfirmationScreen')).toBeFalsy();
      expect(screen.queryByTestId('NewUserScreen')).toBeFalsy();
      expect(screen.queryByTestId('ReturningUserScreen')).toBeFalsy();
      expect(screen.queryByTestId('PasswordResetSentScreen')).toBeFalsy();
      expect(screen.queryByTestId('SetPasswordScreen')).toBeFalsy();
      expect(screen.queryByTestId('SuccessScreen')).toBeFalsy();
    });
    it('shows the OTPConfirmationScreen (and no others)', () => {
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            screen: Screen.OTPConfirmation,
          },
          jest.fn(),
        ];
      });
      render(<StytchUIContainer />);
      expect(screen.queryByTestId('MainScreen')).toBeFalsy();
      expect(screen.getByTestId('OTPConfirmationScreen')).toBeTruthy();
      expect(screen.queryByTestId('EMLConfirmationScreen')).toBeFalsy();
      expect(screen.queryByTestId('NewUserScreen')).toBeFalsy();
      expect(screen.queryByTestId('ReturningUserScreen')).toBeFalsy();
      expect(screen.queryByTestId('PasswordResetSentScreen')).toBeFalsy();
      expect(screen.queryByTestId('SetPasswordScreen')).toBeFalsy();
      expect(screen.queryByTestId('SuccessScreen')).toBeFalsy();
    });
    it('shows the EMLConfirmationScreen (and no others)', () => {
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            screen: Screen.EMLConfirmation,
          },
          jest.fn(),
        ];
      });
      render(<StytchUIContainer />);
      expect(screen.queryByTestId('MainScreen')).toBeFalsy();
      expect(screen.queryByTestId('OTPConfirmationScreen')).toBeFalsy();
      expect(screen.getByTestId('EMLConfirmationScreen')).toBeTruthy();
      expect(screen.queryByTestId('NewUserScreen')).toBeFalsy();
      expect(screen.queryByTestId('ReturningUserScreen')).toBeFalsy();
      expect(screen.queryByTestId('PasswordResetSentScreen')).toBeFalsy();
      expect(screen.queryByTestId('SetPasswordScreen')).toBeFalsy();
      expect(screen.queryByTestId('SuccessScreen')).toBeFalsy();
    });
    it('shows the NewUserScreen (and no others)', () => {
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            screen: Screen.NewUser,
          },
          jest.fn(),
        ];
      });
      render(<StytchUIContainer />);
      expect(screen.queryByTestId('MainScreen')).toBeFalsy();
      expect(screen.queryByTestId('OTPConfirmationScreen')).toBeFalsy();
      expect(screen.queryByTestId('EMLConfirmationScreen')).toBeFalsy();
      expect(screen.getByTestId('NewUserScreen')).toBeTruthy();
      expect(screen.queryByTestId('ReturningUserScreen')).toBeFalsy();
      expect(screen.queryByTestId('PasswordResetSentScreen')).toBeFalsy();
      expect(screen.queryByTestId('SetPasswordScreen')).toBeFalsy();
      expect(screen.queryByTestId('SuccessScreen')).toBeFalsy();
    });
    it('shows the ReturningUserScreen (and no others)', () => {
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            screen: Screen.ReturningUser,
          },
          jest.fn(),
        ];
      });
      render(<StytchUIContainer />);
      expect(screen.queryByTestId('MainScreen')).toBeFalsy();
      expect(screen.queryByTestId('OTPConfirmationScreen')).toBeFalsy();
      expect(screen.queryByTestId('EMLConfirmationScreen')).toBeFalsy();
      expect(screen.queryByTestId('NewUserScreen')).toBeFalsy();
      expect(screen.getByTestId('ReturningUserScreen')).toBeTruthy();
      expect(screen.queryByTestId('PasswordResetSentScreen')).toBeFalsy();
      expect(screen.queryByTestId('SetPasswordScreen')).toBeFalsy();
      expect(screen.queryByTestId('SuccessScreen')).toBeFalsy();
    });
    it('shows the PasswordResetSentScreen (and no others)', () => {
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            screen: Screen.PasswordResetSent,
          },
          jest.fn(),
        ];
      });
      render(<StytchUIContainer />);
      expect(screen.queryByTestId('MainScreen')).toBeFalsy();
      expect(screen.queryByTestId('OTPConfirmationScreen')).toBeFalsy();
      expect(screen.queryByTestId('EMLConfirmationScreen')).toBeFalsy();
      expect(screen.queryByTestId('NewUserScreen')).toBeFalsy();
      expect(screen.queryByTestId('ReturningUserScreen')).toBeFalsy();
      expect(screen.getByTestId('PasswordResetSentScreen')).toBeTruthy();
      expect(screen.queryByTestId('SetPasswordScreen')).toBeFalsy();
      expect(screen.queryByTestId('SuccessScreen')).toBeFalsy();
    });
    it('shows the SetPasswordScreen (and no others)', () => {
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            screen: Screen.SetPassword,
          },
          jest.fn(),
        ];
      });
      render(<StytchUIContainer />);
      expect(screen.queryByTestId('MainScreen')).toBeFalsy();
      expect(screen.queryByTestId('OTPConfirmationScreen')).toBeFalsy();
      expect(screen.queryByTestId('EMLConfirmationScreen')).toBeFalsy();
      expect(screen.queryByTestId('NewUserScreen')).toBeFalsy();
      expect(screen.queryByTestId('ReturningUserScreen')).toBeFalsy();
      expect(screen.queryByTestId('PasswordResetSentScreen')).toBeFalsy();
      expect(screen.getByTestId('SetPasswordScreen')).toBeTruthy();
      expect(screen.queryByTestId('SuccessScreen')).toBeFalsy();
    });
    it('shows the SuccessScreen (and no others)', () => {
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            screen: Screen.Success,
          },
          jest.fn(),
        ];
      });
      render(<StytchUIContainer />);
      expect(screen.queryByTestId('MainScreen')).toBeFalsy();
      expect(screen.queryByTestId('OTPConfirmationScreen')).toBeFalsy();
      expect(screen.queryByTestId('EMLConfirmationScreen')).toBeFalsy();
      expect(screen.queryByTestId('NewUserScreen')).toBeFalsy();
      expect(screen.queryByTestId('ReturningUserScreen')).toBeFalsy();
      expect(screen.queryByTestId('PasswordResetSentScreen')).toBeFalsy();
      expect(screen.queryByTestId('SetPasswordScreen')).toBeFalsy();
      expect(screen.getByTestId('SuccessScreen')).toBeTruthy();
    });
  });
  describe('LoadingDialog', () => {
    it('displays when isSubmitting is true', () => {
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            screenState: {
              ...DEFAULT_UI_STATE.screenState,
              isSubmitting: true,
            },
          },
          jest.fn(),
        ];
      });
      render(<StytchUIContainer />);
      expect(screen.getByTestId('LoadingDialog')).toBeTruthy();
    });

    it('does not display when isSubmitting is false', () => {
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            screenState: {
              ...DEFAULT_UI_STATE.screenState,
              isSubmitting: false,
            },
          },
          jest.fn(),
        ];
      });
      render(<StytchUIContainer />);
      expect(screen.queryByTestId('LoadingDialog')).toBeFalsy();
    });
  });

  describe('Deeplink parser', () => {
    it("is not called for links we don't care about", () => {
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            screenState: {
              ...DEFAULT_UI_STATE.screenState,
              isSubmitting: false,
            },
          },
          jest.fn(),
        ];
      });
      const mocked = jest.fn();
      useDeeplinkParserMock.mockReturnValue({
        parseDeeplink: mocked,
      });
      render(<StytchUIContainer />);
      Linking.emit('url', { url: 'https://stytch.com' });
      expect(mocked).not.toHaveBeenCalled();
    });
    it('is called for links we DO care about', () => {
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            screenState: {
              ...DEFAULT_UI_STATE.screenState,
              isSubmitting: false,
            },
          },
          jest.fn(),
        ];
      });
      const mocked = jest.fn();
      useDeeplinkParserMock.mockReturnValue({
        parseDeeplink: mocked,
      });
      render(<StytchUIContainer />);
      Linking.emit('url', { url: 'stytch-ui-public-token://deeplink' });
      expect(mocked).toHaveBeenCalled();
    });
  });
});
