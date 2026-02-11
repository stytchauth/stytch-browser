import { BootstrapData } from '@stytch/core';
import { B2BMFAProducts } from '@stytch/core/public';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Linking } from 'react-native';

import { StytchB2BClient } from '../../b2b/StytchB2BClient';
import { Platform } from '../../native-module/types';
import { StytchTheme } from '../shared/config';
import { B2BErrorType } from '../shared/types';
import { DEFAULT_UI_CONFIG } from './config';
import * as ContextProvider from './ContextProvider';
import { useDeeplinkParser } from './hooks/useDeeplinkParser';
import { MOCK_ORGANIZATION } from './mocks';
import { Screen } from './screens';
import { DEFAULT_UI_STATE } from './states';
import { StytchB2BUIContainer } from './StytchB2BUIContainer';

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

jest.mock('./hooks/useConsoleLogger', () => {
  return {
    useConsoleLogger: () => ({
      consoleLog: jest.fn(),
    }),
  };
});

describe('StytchB2BUIContainer', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchB2BClient;
    });
    jest.spyOn(ContextProvider, 'useTheme').mockImplementation(() => {
      return {} as StytchTheme;
    });
    jest.spyOn(ContextProvider, 'useConfig').mockImplementation(() => {
      return DEFAULT_UI_CONFIG;
    });
    jest.spyOn(ContextProvider, 'useBootStrapData').mockImplementation(() => {
      return {} as BootstrapData;
    });
    jest.spyOn(ContextProvider, 'usePlatform').mockImplementation(() => {
      return Platform.Android;
    });
    jest.spyOn(ContextProvider, 'useRedirectUrl').mockReturnValue('stytch-ui-something://deeplink');
    jest.spyOn(ContextProvider, 'useEventCallback').mockReturnValue(jest.fn());
    jest.spyOn(ContextProvider, 'useErrorCallback').mockReturnValue(jest.fn());
    useDeeplinkParserMock.mockReturnValue({
      parseDeeplink: jest.fn(),
    });
  });

  beforeEach(() => {
    const listeners: { event: any; handler: any }[] = [];
    const old = Linking.addEventListener;
    Linking.addEventListener = (event: 'url', handler: (event: { url: string }) => void) => {
      listeners.push({ event, handler });
      return old(event, handler);
    };
    Linking.emit = (event: string, props: object) => {
      listeners.filter((l) => l.event === event).forEach((l) => l.handler(props));
    };
    Linking.removeAllListeners = jest.fn();
  });

  // Loop through all screens and ensure they render correctly
  const screensToTest = [
    Screen.Main,
    Screen.EmailConfirmation,
    Screen.Discovery,
    Screen.Error,
    Screen.PasswordAuthenticate,
    Screen.PasswordResetForm,
    Screen.PasswordResetVerifyConfirmation,
    Screen.PasswordForgotForm,
    Screen.PasswordSetNew,
    Screen.PasswordSetNewConfirmation,
    Screen.MFAEnrollmentSelection,
    Screen.RecoveryCodeEntry,
    Screen.RecoveryCodeSave,
    Screen.SMSOTPEnrollment,
    Screen.SMSOTPEntry,
    Screen.TOTPEnrollmentManual,
    Screen.TOTPEntry,
    Screen.EmailMethodSelection,
    Screen.EmailOTPEntry,
  ];

  screensToTest.forEach((screenType) => {
    it(`shows the ${screenType} (and no others)`, () => {
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            screen: screenType,
            // Need to set an error type in order for the error screen to actually show
            screenState: {
              ...DEFAULT_UI_STATE.screenState,
              error: { internalError: B2BErrorType.Default },
            },
            authenticationState: {
              ...DEFAULT_UI_STATE.authenticationState,
              organization: MOCK_ORGANIZATION,
            },
            mfaState: {
              primaryInfo: {
                enrolledMfaMethods: [B2BMFAProducts.smsOtp, B2BMFAProducts.totp],
                memberId: 'member-id',
                memberPhoneNumber: null,
                organizationId: MOCK_ORGANIZATION.organization_id,
                organizationMfaOptionsSupported: [B2BMFAProducts.smsOtp, B2BMFAProducts.totp],
                postAuthScreen: Screen.Success,
              },
              isEnrolling: true,
              smsOtp: {
                isSending: true,
                sendError: undefined,
                codeExpiration: null,
                formattedDestination: null,
                enrolledNumber: null,
              },
              totp: {
                isCreating: true,
                createError: undefined,
                enrollment: null,
              },
            },
          },
          jest.fn(),
        ];
      });
      render(<StytchB2BUIContainer />);

      // Assert the correct screen is visible and all others are hidden
      expect(screen.getByTestId(`${screenType}Screen`)).toBeTruthy();

      screensToTest
        .filter((s) => s !== screenType)
        .forEach((otherScreen) => {
          expect(screen.queryByTestId(`${otherScreen}Screen`)).toBeFalsy();
        });
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
      render(<StytchB2BUIContainer />);
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
      render(<StytchB2BUIContainer />);
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
      render(<StytchB2BUIContainer />);
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
      render(<StytchB2BUIContainer />);
      Linking.emit('url', { url: 'stytch-ui-public-token://deeplink' });
      expect(mocked).toHaveBeenCalled();
    });
  });
});
