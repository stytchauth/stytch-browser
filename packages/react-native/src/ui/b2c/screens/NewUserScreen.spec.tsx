import { OTPMethods, RNUIProducts } from '@stytch/core/public';
import React from 'react';

import { useEmlLoginOrCreate } from '../hooks/emlLoginOrCreate';
import { useOTPEmailLoginOrCreate } from '../hooks/otpEmailLoginOrCreate';
import { usePasswordsCreate } from '../hooks/passwordsCreate';
import { DEFAULT_RENDER_PROPS, fireEvent, ProviderProps, render, screen } from '../testUtils';
import { NewUserScreen } from './NewUserScreen';

jest.mock('../hooks/emlLoginOrCreate');
const useEmlLoginOrCreateMock = jest.mocked(useEmlLoginOrCreate);
jest.mock('../hooks/otpEmailLoginOrCreate');
const useOTPEmailLoginOrCreateMock = jest.mocked(useOTPEmailLoginOrCreate);
jest.mock('../hooks/passwordsCreate');
const usePasswordsCreateMock = jest.mocked(usePasswordsCreate);

describe('NewUserScreen', () => {
  beforeAll(() => {
    useEmlLoginOrCreateMock.mockReturnValue({
      sendEML: jest.fn(),
    });
    useOTPEmailLoginOrCreateMock.mockReturnValue({
      sendEmailOTP: jest.fn(),
    });
    usePasswordsCreateMock.mockReturnValue({
      createPassword: jest.fn(),
    });
  });
  describe('With EML', () => {
    it('Renders as expected', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [RNUIProducts.emailMagicLinks],
        },
      };
      render(props)(<NewUserScreen />);
      expect(screen.getByText('Choose how you would like to create your account.')).toBeTruthy();
      expect(screen.getByText('Email me a login link')).toBeTruthy();
      expect(screen.queryByTestId('DividerWithText')).toBeFalsy();
      expect(screen.queryByText('Finish creating your account by setting a password.')).toBeFalsy();
      expect(screen.queryByText('Create Account')).toBeFalsy();
    });
    it('Email me link sends EML', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [RNUIProducts.emailMagicLinks],
        },
      };
      const mocked = jest.fn();
      useEmlLoginOrCreateMock.mockReturnValue({
        sendEML: mocked,
      });
      render(props)(<NewUserScreen />);
      fireEvent.press(screen.getByText('Email me a login link'));
      expect(mocked).toHaveBeenCalled();
    });
    describe('If passwords are also enabled', () => {
      it('Renders as expected', () => {
        const props: ProviderProps = {
          ...DEFAULT_RENDER_PROPS,
          config: {
            ...DEFAULT_RENDER_PROPS.config,
            products: [RNUIProducts.emailMagicLinks, RNUIProducts.passwords],
          },
        };
        render(props)(<NewUserScreen />);
        expect(screen.getByText('Choose how you would like to create your account.')).toBeTruthy();
        expect(screen.getByText('Email me a login link')).toBeTruthy();
        expect(screen.getByTestId('DividerWithText')).toBeTruthy();
        expect(screen.getByText('Finish creating your account by setting a password.')).toBeTruthy();
      });
    });
  });
  describe('With EOTP', () => {
    it('Renders as expected', () => {
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
      };
      render(props)(<NewUserScreen />);
      expect(screen.getByText('Choose how you would like to create your account.')).toBeTruthy();
      expect(screen.getByText('Email me a login code')).toBeTruthy();
      expect(screen.queryByTestId('DividerWithText')).toBeFalsy();
      expect(screen.queryByText('Finish creating your account by setting a password.')).toBeFalsy();
      expect(screen.queryByText('Create Account')).toBeFalsy();
    });
    it('Email me code sends EOTP', () => {
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
      };
      const mocked = jest.fn();
      useOTPEmailLoginOrCreateMock.mockReturnValue({
        sendEmailOTP: mocked,
      });
      render(props)(<NewUserScreen />);
      fireEvent.press(screen.getByText('Email me a login code'));
      expect(mocked).toHaveBeenCalled();
    });
    describe('If passwords are also enabled', () => {
      it('Renders as expected', () => {
        const props: ProviderProps = {
          ...DEFAULT_RENDER_PROPS,
          config: {
            ...DEFAULT_RENDER_PROPS.config,
            products: [RNUIProducts.otp, RNUIProducts.passwords],
            otpOptions: {
              ...DEFAULT_RENDER_PROPS.config.otpOptions,
              methods: [OTPMethods.Email],
            },
          },
        };
        render(props)(<NewUserScreen />);
        expect(screen.getByText('Choose how you would like to create your account.')).toBeTruthy();
        expect(screen.getByText('Email me a login code')).toBeTruthy();
        expect(screen.getByTestId('DividerWithText')).toBeTruthy();
        expect(screen.getByText('Finish creating your account by setting a password.')).toBeTruthy();
      });
    });
  });
  describe('When EML and OTP are not enabled', () => {
    it('Renders as expected', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [RNUIProducts.passwords],
        },
      };
      render(props)(<NewUserScreen />);
      expect(screen.getByText('Create Account')).toBeTruthy();
    });
  });
  describe('Create A Password', () => {
    it('renders as expected', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [RNUIProducts.passwords],
        },
      };
      render(props)(<NewUserScreen />);
      expect(screen.getByTestId('EmailEntryForm')).toBeTruthy();
      expect(screen.getByTestId('PasswordEntryForm')).toBeTruthy();
      expect(screen.getByTestId('StytchButton')).toBeTruthy();
    });
    it("clicking the button does nothing if it's missing a valid email and password", () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [RNUIProducts.passwords],
        },
      };
      const mocked = jest.fn();
      usePasswordsCreateMock.mockReturnValue({
        createPassword: mocked,
      });
      render(props)(<NewUserScreen />);
      fireEvent.press(screen.getByTestId('StytchButton'));
      expect(mocked).not.toHaveBeenCalled();
    });
    it("clicking the button does nothing if it's missing a valid password", () => {
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
                isValid: true,
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      const mocked = jest.fn();
      usePasswordsCreateMock.mockReturnValue({
        createPassword: mocked,
      });
      render(props)(<NewUserScreen />);
      fireEvent.press(screen.getByTestId('StytchButton'));
      expect(mocked).not.toHaveBeenCalled();
    });
    it("clicking the button does nothing if it's missing a valid email", () => {
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
              password: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.password,
                passwordStrengthCheckResponse: {
                  score: 3,
                  breached_password: false,
                  valid_password: true,
                  request_id: '',
                  status_code: 200,
                  breach_detection_on_create: false,
                  strength_policy: 'luds',
                  feedback: {
                    suggestions: [],
                    warning: '',
                    luds_requirements: {
                      has_digit: true,
                      has_lower_case: true,
                      has_symbol: true,
                      has_upper_case: true,
                      missing_characters: 0,
                      missing_complexity: 0,
                    },
                  },
                },
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      const mocked = jest.fn();
      usePasswordsCreateMock.mockReturnValue({
        createPassword: mocked,
      });
      render(props)(<NewUserScreen />);
      fireEvent.press(screen.getByTestId('StytchButton'));
      expect(mocked).not.toHaveBeenCalled();
    });
    it('clicking the button calls the appropriate hook if it has a valid email and password', () => {
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
                isValid: true,
              },
              password: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.password,
                passwordStrengthCheckResponse: {
                  score: 3,
                  breached_password: false,
                  valid_password: true,
                  request_id: '',
                  status_code: 200,
                  breach_detection_on_create: false,
                  strength_policy: 'luds',
                  feedback: {
                    suggestions: [],
                    warning: '',
                    luds_requirements: {
                      has_digit: true,
                      has_lower_case: true,
                      has_symbol: true,
                      has_upper_case: true,
                      missing_characters: 0,
                      missing_complexity: 0,
                    },
                  },
                },
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      const mocked = jest.fn();
      usePasswordsCreateMock.mockReturnValue({
        createPassword: mocked,
      });
      render(props)(<NewUserScreen />);
      fireEvent.press(screen.getByTestId('StytchButton'));
      expect(mocked).toHaveBeenCalled();
    });
  });
});
