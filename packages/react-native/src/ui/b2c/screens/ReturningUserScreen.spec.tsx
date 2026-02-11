import React from 'react';
import { useEmlLoginOrCreate } from '../hooks/emlLoginOrCreate';
import { useOTPEmailLoginOrCreate } from '../hooks/otpEmailLoginOrCreate';
import { usePasswordsAuthenticate } from '../hooks/passwordsAuthenticate';
import { usePasswordsResetByEmailStart } from '../hooks/passwordsResetByEmailStart';
import { ReturningUserScreen } from './ReturningUserScreen';
import { render, screen, fireEvent, DEFAULT_RENDER_PROPS, ProviderProps, flushPromises } from '../testUtils';
import { OTPMethods, RNUIProducts, StytchAPIError } from '@stytch/core/public';

jest.mock('../hooks/emlLoginOrCreate');
const useEmlLoginOrCreateMock = jest.mocked(useEmlLoginOrCreate);
jest.mock('../hooks/otpEmailLoginOrCreate');
const useOTPEmailLoginOrCreateMock = jest.mocked(useOTPEmailLoginOrCreate);
jest.mock('../hooks/passwordsAuthenticate');
const usePasswordsAuthenticateMock = jest.mocked(usePasswordsAuthenticate);
jest.mock('../hooks/passwordsResetByEmailStart');
const usePasswordsResetByEmailStartMock = jest.mocked(usePasswordsResetByEmailStart);

describe('ReturningUserScreen', () => {
  beforeAll(() => {
    useEmlLoginOrCreateMock.mockReturnValue({
      sendEML: jest.fn(),
    });
    useOTPEmailLoginOrCreateMock.mockReturnValue({
      sendEmailOTP: jest.fn(),
    });
    usePasswordsAuthenticateMock.mockReturnValue({
      authenticatePassword: jest.fn(),
    });
    usePasswordsResetByEmailStartMock.mockReturnValue({
      resetPasswordByEmailStart: jest.fn(),
    });
  });
  describe('Default', () => {
    it('Displays as expected', () => {
      render(DEFAULT_RENDER_PROPS)(<ReturningUserScreen />);
      expect(screen.getByText('Log in')).toBeTruthy();
      expect(screen.getByTestId('EmailEntryForm')).toBeTruthy();
      expect(screen.getByTestId('PasswordEntryForm')).toBeTruthy();
      expect(screen.getByText('Continue')).toBeTruthy();
      expect(screen.getByText('Forgot password?')).toBeTruthy();
    });
    it('Calls the PasswordsAuthenticate hook when appropriate', () => {
      const mocked = jest.fn();
      usePasswordsAuthenticateMock.mockReturnValue({
        authenticatePassword: mocked.mockResolvedValue(''),
      });
      render(DEFAULT_RENDER_PROPS)(<ReturningUserScreen />);
      fireEvent.press(screen.getByText('Continue'));
      expect(mocked).not.toHaveBeenCalled(); // Because the button is disabled

      let props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              emailAddress: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.emailAddress,
                emailAddress: 'robot@stytch.com',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<ReturningUserScreen />);
      fireEvent.press(screen.getByText('Continue'));
      expect(mocked).not.toHaveBeenCalled(); // Because the button is disabled

      props = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              password: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.password,
                password: 'my cool password',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<ReturningUserScreen />);
      fireEvent.press(screen.getByText('Continue'));
      expect(mocked).not.toHaveBeenCalled(); // Because the button is disabled

      props = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              emailAddress: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.emailAddress,
                emailAddress: 'robot@stytch.com',
              },
              password: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.password,
                password: 'my cool password',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<ReturningUserScreen />);
      fireEvent.press(screen.getByText('Continue'));
      expect(mocked).toHaveBeenCalled(); // Because the button is enabled!
    });
    it('Calls the password reset hook with appropriate type when passwords authenticate fails', async () => {
      usePasswordsAuthenticateMock.mockReturnValue({
        authenticatePassword: jest.fn().mockRejectedValue(
          new StytchAPIError({
            status_code: 400,
            error_type: 'reset_password',
            error_message: 'Some error message',
            error_url: 'https://stytch.com',
          }),
        ),
      });
      const mocked = jest.fn();
      usePasswordsResetByEmailStartMock.mockReturnValue({
        resetPasswordByEmailStart: mocked,
      });
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              emailAddress: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.emailAddress,
                emailAddress: 'robot@stytch.com',
              },
              password: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.password,
                password: 'my cool password',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<ReturningUserScreen />);
      fireEvent.press(screen.getByText('Continue'));
      await flushPromises();
      expect(mocked).toHaveBeenCalledWith('dedupe');
    });
    it('Calls password reset hook with appropriate type when forgot password is clicked', () => {
      const mocked = jest.fn();
      usePasswordsResetByEmailStartMock.mockReturnValue({
        resetPasswordByEmailStart: mocked,
      });
      render(DEFAULT_RENDER_PROPS)(<ReturningUserScreen />);
      fireEvent.press(screen.getByText('Forgot password?'));
      expect(mocked).toHaveBeenCalledWith('forgot');
    });
  });
  describe('With EML', () => {
    it('Displays as expected and calls the EML hook when appropriate', () => {
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
      render(props)(<ReturningUserScreen />);
      expect(screen.getByTestId('DividerWithText')).toBeTruthy();
      expect(screen.getByText('Email me a login link')).toBeTruthy();
      fireEvent.press(screen.getByText('Email me a login link'));
      expect(mocked).toHaveBeenCalled();
    });
  });
  describe('With EOTP', () => {
    it('Displays as expected and calls the EOTP hook when appropriate', () => {
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
      render(props)(<ReturningUserScreen />);
      expect(screen.getByTestId('DividerWithText')).toBeTruthy();
      expect(screen.getByText('Email me a login code')).toBeTruthy();
      fireEvent.press(screen.getByText('Email me a login code'));
      expect(mocked).toHaveBeenCalled();
    });
  });
});
