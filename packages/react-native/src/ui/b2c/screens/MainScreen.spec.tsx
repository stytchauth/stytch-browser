import { OAuthProviders, OTPMethods, RNUIProducts } from '@stytch/core/public';
import React from 'react';

import { Platform } from '../../../native-module/types';
import { useEmlLoginOrCreate } from '../hooks/emlLoginOrCreate';
import { useOAuthStart } from '../hooks/oauthStart';
import { useOTPEmailLoginOrCreate } from '../hooks/otpEmailLoginOrCreate';
import { useOTPSmsLoginOrCreate } from '../hooks/otpSmsLoginOrCreate';
import { useOTPWhatsappLoginOrCreate } from '../hooks/otpWhatsappLoginOrCreate';
import { usePasswordsResetByEmailStart } from '../hooks/passwordsResetByEmailStart';
import { useUserSearch } from '../hooks/userSearch';
import { DEFAULT_RENDER_PROPS, fireEvent, ProviderProps, render, screen } from '../testUtils';
import { MainScreen } from './MainScreen';

jest.mock('react-native-country-codes-picker', () => {
  return {
    CountryPicker: jest.fn(),
  };
});

jest.mock('../../../native-module', function () {
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

jest.mock('../hooks/userSearch');
const mockedUserSearch = jest.mocked(useUserSearch);
jest.mock('../hooks/otpSmsLoginOrCreate');
const mockedUseOTPSmsLoginOrCreate = jest.mocked(useOTPSmsLoginOrCreate);
jest.mock('../hooks/otpWhatsappLoginOrCreate');
const mockedUseOTPWhatsappLoginOrCreate = jest.mocked(useOTPWhatsappLoginOrCreate);
jest.mock('../hooks/otpEmailLoginOrCreate');
const mockedUseOTPEmailLoginOrCreate = jest.mocked(useOTPEmailLoginOrCreate);
jest.mock('../hooks/emlLoginOrCreate');
const mockedUseEmlLoginOrCreate = jest.mocked(useEmlLoginOrCreate);
jest.mock('../hooks/passwordsResetByEmailStart');
const mockedUsePasswordsResetByEmailStart = jest.mocked(usePasswordsResetByEmailStart);
jest.mock('../hooks/oauthStart');
const mockedUseOAuthStart = jest.mocked(useOAuthStart);

describe('MainScreen', () => {
  beforeAll(() => {
    mockedUserSearch.mockReturnValue({
      searchForUser: jest.fn(),
    });
    mockedUseOTPSmsLoginOrCreate.mockReturnValue({
      sendSMSOTP: jest.fn(),
    });
    mockedUseOTPEmailLoginOrCreate.mockReturnValue({
      sendEmailOTP: jest.fn(),
    });
    mockedUseOTPWhatsappLoginOrCreate.mockReturnValue({
      sendWhatsAppOTP: jest.fn(),
    });
    mockedUseEmlLoginOrCreate.mockReturnValue({
      sendEML: jest.fn(),
    });
    mockedUsePasswordsResetByEmailStart.mockReturnValue({
      resetPasswordByEmailStart: jest.fn(),
    });
  });
  describe('Given a default configuration', () => {
    it('renders as expected', () => {
      render(DEFAULT_RENDER_PROPS)(<MainScreen />);
      expect(screen.getByTestId('MainScreen')).toBeTruthy();
      expect(screen.getByTestId('PageTitle')).toBeTruthy();
      expect(screen.queryByTestId('OAuthButton')).toBeFalsy();
      expect(screen.queryByTestId('DividerWithText')).toBeFalsy();
      expect(screen.queryByTestId('TabComponent')).toBeFalsy();
      expect(screen.getByTestId('EmailEntryForm')).toBeTruthy();
    });
  });
  describe('With page title hidden', () => {
    it('renders as expected', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        theme: {
          ...DEFAULT_RENDER_PROPS.theme,
          hideHeaderText: true,
        },
      };
      render(props)(<MainScreen />);
      expect(screen.getByTestId('MainScreen')).toBeTruthy();
      expect(screen.queryByTestId('PageTitle')).toBeFalsy();
    });
  });
  describe('With oauth providers', () => {
    it('renders as expected and oauth clicks trigger the appropriate action', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [RNUIProducts.oauth],
          oAuthOptions: {
            ...DEFAULT_RENDER_PROPS.config.oAuthOptions,
            providers: [OAuthProviders.Apple, OAuthProviders.Google, OAuthProviders.Github],
          },
        },
      };
      const mockedOauthStart = jest.fn();
      mockedUseOAuthStart.mockReturnValue({
        startOAuthForProvider: mockedOauthStart,
      });
      render(props)(<MainScreen />);
      expect(screen.getByTestId('MainScreen')).toBeTruthy();
      const oauthButtons = screen.queryAllByTestId('OAuthButton');
      expect(oauthButtons.length).toBe(3);
      expect(screen.getByText('Continue with Apple')).toBeTruthy();
      expect(screen.getByText('Continue with Google')).toBeTruthy();
      expect(screen.getByText('Continue with Github')).toBeTruthy();
      fireEvent.press(screen.getByText('Continue with Github'));
      fireEvent.press(screen.getByText('Continue with Apple'));
      fireEvent.press(screen.getByText('Continue with Google'));
      expect(mockedOauthStart).toHaveBeenNthCalledWith(1, {
        provider: OAuthProviders.Github,
        customScopes: [],
        providerParams: {},
      });
      expect(mockedOauthStart).toHaveBeenNthCalledWith(2, {
        provider: OAuthProviders.Apple,
        customScopes: [],
        providerParams: {},
      });
      expect(mockedOauthStart).toHaveBeenNthCalledWith(3, {
        provider: OAuthProviders.Google,
        customScopes: [],
        providerParams: {},
      });
    });
  });
  describe('With oauth providers and email input', () => {
    it('renders as expected', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [RNUIProducts.oauth, RNUIProducts.emailMagicLinks],
        },
      };
      render(props)(<MainScreen />);
      expect(screen.getByTestId('MainScreen')).toBeTruthy();
      expect(screen.getByTestId('DividerWithText')).toBeTruthy();
    });
  });
  describe('With multiple inputs', () => {
    it('renders as expected', async () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [RNUIProducts.otp, RNUIProducts.emailMagicLinks],
          otpOptions: {
            ...DEFAULT_RENDER_PROPS.config.otpOptions,
            methods: [OTPMethods.SMS, OTPMethods.WhatsApp],
          },
        },
      };
      render(props)(<MainScreen />);
      expect(screen.getByTestId('MainScreen')).toBeTruthy();
      expect(screen.getByTestId('TabComponent')).toBeTruthy();
      expect(screen.getByText('Email')).toBeTruthy();
      expect(screen.getByText('WhatsApp')).toBeTruthy();
      expect(screen.getByText('Text')).toBeTruthy();
      expect(screen.getByTestId('PhoneEntryForm')).toBeTruthy();
      expect(screen.queryByTestId('EmailEntryForm')).toBeFalsy();

      fireEvent.press(screen.getByText('Text'));
      expect(await screen.findByTestId('PhoneEntryForm')).toBeTruthy();
      expect(screen.queryByTestId('EmailEntryForm')).toBeFalsy();

      fireEvent.press(screen.getByText('WhatsApp'));
      expect(await screen.findByTestId('PhoneEntryForm')).toBeTruthy();
      expect(screen.queryByTestId('EmailEntryForm')).toBeFalsy();

      fireEvent.press(screen.getByText('Email'));
      expect(await screen.findByTestId('EmailEntryForm')).toBeTruthy();
      expect(screen.queryByTestId('PhoneEntryForm')).toBeFalsy();
    });
  });
  describe('Email Entry', () => {
    it('Hook is not fired when button is disabled', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [RNUIProducts.emailMagicLinks],
        },
      };
      const mocked = jest.fn();
      mockedUserSearch.mockReturnValue({
        searchForUser: mocked,
      });
      render(props)(<MainScreen />);
      expect(screen.getByTestId('EmailEntryForm')).toBeTruthy();
      fireEvent.press(screen.getByTestId('StytchButton'));
      expect(mocked).not.toHaveBeenCalled();
    });
    it('User search hook is fired when button is enabled and passwords are present', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [RNUIProducts.passwords],
        },
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              emailAddress: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.emailAddress,
                isValid: true,
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      const mocked = jest.fn();
      mockedUserSearch.mockReturnValue({
        searchForUser: mocked,
      });
      render(props)(<MainScreen />);
      expect(screen.getByTestId('EmailEntryForm')).toBeTruthy();
      fireEvent.press(screen.getByTestId('StytchButton'));
      expect(mocked).toHaveBeenCalled();
    });
    it('User search hook is NOT fired when button is enabled and passwords are NOT present', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [RNUIProducts.emailMagicLinks],
        },
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              emailAddress: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.emailAddress,
                isValid: true,
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      const mocked = jest.fn();
      mockedUserSearch.mockReturnValue({
        searchForUser: mocked,
      });
      render(props)(<MainScreen />);
      expect(screen.getByTestId('EmailEntryForm')).toBeTruthy();
      fireEvent.press(screen.getByTestId('StytchButton'));
      expect(mocked).not.toHaveBeenCalled();
    });
  });
  describe('SMS Phone Entry', () => {
    it('Hook is not fired when button is disabled', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [RNUIProducts.otp],
          otpOptions: {
            ...DEFAULT_RENDER_PROPS.config.otpOptions,
            methods: [OTPMethods.SMS],
          },
        },
      };
      const mocked = jest.fn();
      mockedUseOTPSmsLoginOrCreate.mockReturnValue({
        sendSMSOTP: mocked,
      });
      render(props)(<MainScreen />);
      expect(screen.getByTestId('PhoneEntryForm')).toBeTruthy();
      fireEvent.press(screen.getByTestId('StytchButton'));
      expect(mocked).not.toHaveBeenCalled();
    });
    it('Hook is fired when button is enabled', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [RNUIProducts.otp],
          otpOptions: {
            ...DEFAULT_RENDER_PROPS.config.otpOptions,
            methods: [OTPMethods.SMS],
          },
        },
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              phoneNumber: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.phoneNumber,
                countryCode: '+1',
                phoneNumber: '5005550006',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      const mocked = jest.fn();
      mockedUseOTPSmsLoginOrCreate.mockReturnValue({
        sendSMSOTP: mocked,
      });
      render(props)(<MainScreen />);
      expect(screen.getByTestId('PhoneEntryForm')).toBeTruthy();
      fireEvent.press(screen.getByTestId('StytchButton'));
      expect(mocked).toHaveBeenCalled();
    });
  });
  describe('WhatsApp Phone Entry', () => {
    it('Hook is not fired when button is disabled', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [RNUIProducts.otp],
          otpOptions: {
            ...DEFAULT_RENDER_PROPS.config.otpOptions,
            methods: [OTPMethods.WhatsApp],
          },
        },
      };
      const mocked = jest.fn();
      mockedUseOTPWhatsappLoginOrCreate.mockReturnValue({
        sendWhatsAppOTP: mocked,
      });
      render(props)(<MainScreen />);
      expect(screen.getByTestId('PhoneEntryForm')).toBeTruthy();
      fireEvent.press(screen.getByTestId('StytchButton'));
      expect(mocked).not.toHaveBeenCalled();
    });
    it('Hook is fired when button is enabled', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [RNUIProducts.otp],
          otpOptions: {
            ...DEFAULT_RENDER_PROPS.config.otpOptions,
            methods: [OTPMethods.WhatsApp],
          },
        },
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              phoneNumber: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.phoneNumber,
                countryCode: '+1',
                phoneNumber: '5005550006',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      const mocked = jest.fn();
      mockedUseOTPWhatsappLoginOrCreate.mockReturnValue({
        sendWhatsAppOTP: mocked,
      });
      render(props)(<MainScreen />);
      expect(screen.getByTestId('PhoneEntryForm')).toBeTruthy();
      fireEvent.press(screen.getByTestId('StytchButton'));
      expect(mocked).toHaveBeenCalled();
    });
  });
  describe('When user search returns a passwordless user', () => {
    describe('and Email OTP is defined', () => {
      it('sends an EmailOTP', () => {
        const props: ProviderProps = {
          ...DEFAULT_RENDER_PROPS,
          config: {
            ...DEFAULT_RENDER_PROPS.config,
            products: [RNUIProducts.otp],
            otpOptions: {
              ...DEFAULT_RENDER_PROPS.config.otpOptions,
              methods: [OTPMethods.Email],
            },
          },
          state: [
            {
              ...DEFAULT_RENDER_PROPS.state[0],
              userState: {
                ...DEFAULT_RENDER_PROPS.state[0].userState,
                userType: 'passwordless',
                emailAddress: {
                  ...DEFAULT_RENDER_PROPS.state[0].userState.emailAddress,
                  isValid: true,
                },
              },
            },
            DEFAULT_RENDER_PROPS.state[1],
          ],
        };
        const mockedSendEmailOTP = jest.fn();
        mockedUseOTPEmailLoginOrCreate.mockReturnValue({
          sendEmailOTP: mockedSendEmailOTP,
        });
        mockedUserSearch.mockReturnValue({
          searchForUser: jest.fn(),
        });
        render(props)(<MainScreen />);
        fireEvent.press(screen.getByTestId('StytchButton'));
        expect(mockedSendEmailOTP).toHaveBeenCalled();
      });
    });
    describe('and EML is defined', () => {
      it('sends an EML', () => {
        const props: ProviderProps = {
          ...DEFAULT_RENDER_PROPS,
          config: {
            ...DEFAULT_RENDER_PROPS.config,
            products: [RNUIProducts.emailMagicLinks],
          },
          state: [
            {
              ...DEFAULT_RENDER_PROPS.state[0],
              userState: {
                ...DEFAULT_RENDER_PROPS.state[0].userState,
                userType: 'passwordless',
                emailAddress: {
                  ...DEFAULT_RENDER_PROPS.state[0].userState.emailAddress,
                  isValid: true,
                },
              },
            },
            DEFAULT_RENDER_PROPS.state[1],
          ],
        };
        const mockedSendEML = jest.fn();
        mockedUseEmlLoginOrCreate.mockReturnValue({
          sendEML: mockedSendEML,
        });
        mockedUserSearch.mockReturnValue({
          searchForUser: jest.fn(),
        });
        render(props)(<MainScreen />);
        fireEvent.press(screen.getByTestId('StytchButton'));
        expect(mockedSendEML).toHaveBeenCalled();
      });
    });
    describe('and EML and EOTP are not defined', () => {
      it('sends a password reset', () => {
        const props: ProviderProps = {
          ...DEFAULT_RENDER_PROPS,
          config: {
            ...DEFAULT_RENDER_PROPS.config,
            products: [RNUIProducts.passwords],
          },
          state: [
            {
              ...DEFAULT_RENDER_PROPS.state[0],
              userState: {
                ...DEFAULT_RENDER_PROPS.state[0].userState,
                userType: 'passwordless',
                emailAddress: {
                  ...DEFAULT_RENDER_PROPS.state[0].userState.emailAddress,
                  isValid: true,
                },
              },
            },
            DEFAULT_RENDER_PROPS.state[1],
          ],
        };
        const mockedSendPasswordReset = jest.fn();
        mockedUsePasswordsResetByEmailStart.mockReturnValue({
          resetPasswordByEmailStart: mockedSendPasswordReset,
        });
        mockedUserSearch.mockReturnValue({
          searchForUser: jest.fn(),
        });
        render(props)(<MainScreen />);
        fireEvent.press(screen.getByTestId('StytchButton'));
        expect(mockedSendPasswordReset).toHaveBeenCalled();
      });
    });
  });
});
