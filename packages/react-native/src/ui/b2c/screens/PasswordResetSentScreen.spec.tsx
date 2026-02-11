import { OTPMethods, RNUIProducts } from '@stytch/core/public';
import React from 'react';

import { useEmlLoginOrCreate } from '../hooks/emlLoginOrCreate';
import { useOTPEmailLoginOrCreate } from '../hooks/otpEmailLoginOrCreate';
import { usePasswordsResetByEmailStart } from '../hooks/passwordsResetByEmailStart';
import { DEFAULT_RENDER_PROPS, fireEvent, ProviderProps, render, screen } from '../testUtils';
import { PasswordResetSentScreen } from './PasswordResetSentScreen';

jest.mock('../hooks/emlLoginOrCreate');
const useEmlLoginOrCreateMock = jest.mocked(useEmlLoginOrCreate);
jest.mock('../hooks/otpEmailLoginOrCreate');
const useOTPEmailLoginOrCreateMock = jest.mocked(useOTPEmailLoginOrCreate);
jest.mock('../hooks/passwordsResetByEmailStart');
const usePasswordsResetByEmailStartMock = jest.mocked(usePasswordsResetByEmailStart);

describe('PasswordResetSentScreen', () => {
  beforeAll(() => {
    useEmlLoginOrCreateMock.mockReturnValue({
      sendEML: jest.fn(),
    });
    useOTPEmailLoginOrCreateMock.mockReturnValue({
      sendEmailOTP: jest.fn(),
    });
    usePasswordsResetByEmailStartMock.mockReturnValue({
      resetPasswordByEmailStart: jest.fn(),
    });
  });
  describe('Breached Password', () => {
    it('Renders with correct content', () => {
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
                resetType: 'breached',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<PasswordResetSentScreen />);
      screen.getByText('Check your email to set a new password');
      screen.getByText(
        'A different site where you use the same password had a security issue recently. For your safety, an email was sent to you at robot@stytch.com to reset your password.',
      );
    });
  });
  describe('Dedupe Password', () => {
    it('Renders with correct content', () => {
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
                resetType: 'dedupe',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<PasswordResetSentScreen />);
      screen.getByText('Check your email to set a new password');
      screen.getByText(
        'We want to make sure your account is secure and that it’s really you logging in! A login link was sent to you at robot@stytch.com.',
      );
    });
  });
  describe('Forgot Password', () => {
    it('Renders with correct content', () => {
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
                resetType: 'forgot',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<PasswordResetSentScreen />);
      screen.getByText('Forgot password?');
      screen.getByText('A link to reset your password was sent to you at robot@stytch.com.');
    });
  });
  describe('No Password', () => {
    it('Renders with correct content', () => {
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
                resetType: 'none',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<PasswordResetSentScreen />);
      screen.getByText('Check your email to set a new password');
      screen.getByText('A login link was sent to you at robot@stytch.com to create a password for your account.');
    });
  });
  describe('With EML', () => {
    it('Renders the appropriate UI and calls the correct hook', () => {
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
      render(props)(<PasswordResetSentScreen />);
      expect(screen.getByTestId('DividerWithText')).toBeTruthy();
      expect(screen.getByText('Email me a login link')).toBeTruthy();
      fireEvent.press(screen.getByText('Email me a login link'));
      expect(mocked).toHaveBeenCalled();
    });
  });
  describe('With EOTP', () => {
    it('Renders the appropriate UI and calls the correct hook', () => {
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
      render(props)(<PasswordResetSentScreen />);
      expect(screen.getByTestId('DividerWithText')).toBeTruthy();
      expect(screen.getByText('Email me a login code')).toBeTruthy();
      fireEvent.press(screen.getByText('Email me a login code'));
      expect(mocked).toHaveBeenCalled();
    });
  });
  describe('ResendDialog', () => {
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
          },
        },
        DEFAULT_RENDER_PROPS.state[1],
      ],
    };
    it('Button is visible, but dialog is not', () => {
      render(props)(<PasswordResetSentScreen />);
      expect(screen.getByTestId('ShowResendDialogButton')).toBeTruthy();
      expect(screen.queryByTestId('AlertDialog')).toBeFalsy();
    });
    it('Clicking the button launches the dialog', () => {
      render(props)(<PasswordResetSentScreen />);
      fireEvent.press(screen.getByTestId('ShowResendDialogButton'));
      expect(screen.getByTestId('AlertDialog')).toBeTruthy();
    });
    it('disappears when you press outside of the dialog', () => {
      render(props)(<PasswordResetSentScreen />);
      fireEvent.press(screen.getByTestId('ShowResendDialogButton'));
      expect(screen.getByTestId('AlertDialog')).toBeTruthy();
      fireEvent.press(screen.getByTestId('DialogShade'));
      expect(screen.queryByTestId('AlertDialog')).toBeFalsy();
    });
    it('disappears when you click to cancel the dialog', () => {
      render(DEFAULT_RENDER_PROPS)(<PasswordResetSentScreen />);
      fireEvent.press(screen.getByTestId('ShowResendDialogButton'));
      expect(screen.getByTestId('AlertDialog')).toBeTruthy();
      fireEvent.press(screen.getByText('Cancel'));
      expect(screen.queryByTestId('AlertDialog')).toBeFalsy();
    });
    it('resends the password reset email and closes the dialog when you click send link', () => {
      const mocked = jest.fn();
      usePasswordsResetByEmailStartMock.mockReturnValue({
        resetPasswordByEmailStart: mocked,
      });
      render(DEFAULT_RENDER_PROPS)(<PasswordResetSentScreen />);
      fireEvent.press(screen.getByTestId('ShowResendDialogButton'));
      expect(screen.getByTestId('AlertDialog')).toBeTruthy();
      fireEvent.press(screen.getByText('Send link'));
      expect(screen.queryByTestId('AlertDialog')).toBeFalsy();
      expect(mocked).toHaveBeenCalled();
    });
  });
});
