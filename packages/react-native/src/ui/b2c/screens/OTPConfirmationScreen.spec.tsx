import { RNUIProducts } from '@stytch/core/public';
import React from 'react';

import { useOTPEmailLoginOrCreate } from '../hooks/otpEmailLoginOrCreate';
import { useOTPSmsLoginOrCreate } from '../hooks/otpSmsLoginOrCreate';
import { useOTPWhatsappLoginOrCreate } from '../hooks/otpWhatsappLoginOrCreate';
import { usePasswordsResetByEmailStart } from '../hooks/passwordsResetByEmailStart';
import { act, DEFAULT_RENDER_PROPS, fireEvent, ProviderProps, render, screen } from '../testUtils';
import { OTPConfirmationScreen } from './OTPConfirmationScreen';

jest.mock('../hooks/passwordsResetByEmailStart');
const usePasswordsResetByEmailStartMock = jest.mocked(usePasswordsResetByEmailStart);
jest.mock('../hooks/otpEmailLoginOrCreate');
const useOTPEmailLoginOrCreateMock = jest.mocked(useOTPEmailLoginOrCreate);
jest.mock('../hooks/otpSmsLoginOrCreate');
const useOTPSmsLoginOrCreateMock = jest.mocked(useOTPSmsLoginOrCreate);
jest.mock('../hooks/otpWhatsappLoginOrCreate');
const useOTPWhatsappLoginOrCreateMock = jest.mocked(useOTPWhatsappLoginOrCreate);

describe('OTPConfirmationScreen', () => {
  beforeAll(() => {
    usePasswordsResetByEmailStartMock.mockReturnValue({
      resetPasswordByEmailStart: jest.fn(),
    });
    useOTPEmailLoginOrCreateMock.mockReturnValue({
      sendEmailOTP: jest.fn(),
    });
    useOTPSmsLoginOrCreateMock.mockReturnValue({
      sendSMSOTP: jest.fn(),
    });
    useOTPWhatsappLoginOrCreateMock.mockReturnValue({
      sendWhatsAppOTP: jest.fn(),
    });
  });
  describe('Email OTP', () => {
    it('Renders as expected', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            authenticationState: {
              ...DEFAULT_RENDER_PROPS.state[0].authenticationState,
              otpMethod: 'email',
            },
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              emailAddress: {
                emailAddress: 'robot@stytch.com',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<OTPConfirmationScreen />);
      expect(screen.getByText('Enter Passcode')).toBeTruthy();
      expect(screen.getByText('A 6-digit passcode was sent to you at robot@stytch.com.')).toBeTruthy();
      expect(screen.getByTestId('OTPEntry')).toBeTruthy();
    });
  });

  describe('SMS OTP', () => {
    it('Renders as expected', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            authenticationState: {
              ...DEFAULT_RENDER_PROPS.state[0].authenticationState,
              otpMethod: 'sms',
            },
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
      render(props)(<OTPConfirmationScreen />);
      expect(screen.getByText('Enter Passcode')).toBeTruthy();
      expect(screen.getByText('A 6-digit passcode was sent to you at (500) 555-0006.')).toBeTruthy();
      expect(screen.getByTestId('OTPEntry')).toBeTruthy();
    });
  });

  describe('WhatsApp OTP', () => {
    it('Renders as expected', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            authenticationState: {
              ...DEFAULT_RENDER_PROPS.state[0].authenticationState,
              otpMethod: 'whatsapp',
            },
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
      render(props)(<OTPConfirmationScreen />);
      expect(screen.getByText('Enter Passcode')).toBeTruthy();
      expect(screen.getByText('A 6-digit passcode was sent to you at (500) 555-0006.')).toBeTruthy();
      expect(screen.getByTestId('OTPEntry')).toBeTruthy();
    });
  });
  describe('Countdown', () => {
    it('correctly calculates the display time', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          otpOptions: {
            ...DEFAULT_RENDER_PROPS.config.otpOptions,
            expirationMinutes: 2,
          },
        },
      };
      render(props)(<OTPConfirmationScreen />);
      expect(screen.getByText('Your code expires in 2:00. Didn’t get it? Resend code.')).toBeTruthy();
    });
    it('updates every second', async () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          otpOptions: {
            ...DEFAULT_RENDER_PROPS.config.otpOptions,
            expirationMinutes: 2,
          },
        },
      };
      jest.useFakeTimers();
      render(props)(<OTPConfirmationScreen />);
      expect(screen.getByText('Your code expires in 2:00. Didn’t get it? Resend code.')).toBeTruthy();
      act(() => jest.advanceTimersByTime(1000));
      expect(screen.getByText('Your code expires in 01:59. Didn’t get it? Resend code.')).toBeTruthy();
      act(() => jest.advanceTimersByTime(1000));
      expect(screen.getByText('Your code expires in 01:58. Didn’t get it? Resend code.')).toBeTruthy();
      act(() => jest.runOnlyPendingTimers());
      jest.useRealTimers();
    });
    it('stops updating when it reaches 0', async () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          otpOptions: {
            ...DEFAULT_RENDER_PROPS.config.otpOptions,
            expirationMinutes: 0,
          },
        },
      };
      render(props)(<OTPConfirmationScreen />);
      expect(screen.getByText('Your code expires in 0:00. Didn’t get it? Resend code.')).toBeTruthy();
      await new Promise((r) => setTimeout(r, 1000)); // wait one second longer than expiration, just to be sure it doesnt go negative
      expect(screen.getByText('Your code expires in 0:00. Didn’t get it? Resend code.')).toBeTruthy();
    });
  });
  describe('Create Password Option', () => {
    it("doesn't show for new users with passwords disabled", () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [],
        },
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              userType: 'new',
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<OTPConfirmationScreen />);
      expect(screen.queryByTestId('DividerWithText')).toBeFalsy();
      expect(screen.queryByText('Create a password instead')).toBeFalsy();
    });
    it("doesn't show for new users with passwords enabled", () => {
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
              userType: 'new',
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<OTPConfirmationScreen />);
      expect(screen.queryByTestId('DividerWithText')).toBeFalsy();
      expect(screen.queryByText('Create a password instead')).toBeFalsy();
    });
    it("doesn't show for returning password users with passwords disabled", () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [],
        },
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              userType: 'password',
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<OTPConfirmationScreen />);
      expect(screen.queryByTestId('DividerWithText')).toBeFalsy();
      expect(screen.queryByText('Create a password instead')).toBeFalsy();
    });
    it('doesnt show for returning password users with passwords enabled and no email address set', () => {
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
              userType: 'password',
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<OTPConfirmationScreen />);
      expect(screen.queryByTestId('DividerWithText')).toBeFalsy();
      expect(screen.queryByText('Create a password instead')).toBeFalsy();
    });
    it('does show for returning password users with passwords enabled and an email address set', () => {
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
              userType: 'password',
              emailAddress: {
                emailAddress: 'robot@stytch.com',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<OTPConfirmationScreen />);
      expect(screen.getByTestId('DividerWithText')).toBeTruthy();
      expect(screen.getByText('Create a password instead')).toBeTruthy();
    });
    it("doesn't show for returning passwordless users with passwords disabled", () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [],
        },
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              userType: 'passwordless',
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<OTPConfirmationScreen />);
      expect(screen.queryByTestId('DividerWithText')).toBeFalsy();
      expect(screen.queryByText('Create a password instead')).toBeFalsy();
    });
    it('doesnt show for returning passwordless users with passwords enabled', () => {
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
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<OTPConfirmationScreen />);
      expect(screen.queryByTestId('DividerWithText')).toBeFalsy();
      expect(screen.queryByText('Create a password instead')).toBeFalsy();
    });
    it('does show for returning passwordless users with passwords enabled and email address set', () => {
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
                emailAddress: 'robot@stytch.com',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<OTPConfirmationScreen />);
      expect(screen.getByTestId('DividerWithText')).toBeTruthy();
      expect(screen.getByText('Create a password instead')).toBeTruthy();
    });
    // These next two will never happen IRL, but because we're testing the screen in isolation, it IS a valid state
    it("doesn't show for unknown users with passwords disabled", () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [],
        },
      };
      render(props)(<OTPConfirmationScreen />);
      expect(screen.queryByTestId('DividerWithText')).toBeFalsy();
      expect(screen.queryByText('Create a password instead')).toBeFalsy();
    });
    it('does show for unknown users with passwords enabled and no email set', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        config: {
          ...DEFAULT_RENDER_PROPS.config,
          products: [RNUIProducts.passwords],
        },
      };
      render(props)(<OTPConfirmationScreen />);
      expect(screen.queryByTestId('DividerWithText')).toBeFalsy();
      expect(screen.queryByText('Create a password instead')).toBeFalsy();
    });
    it('does show for unknown users with passwords enabled and email set', () => {
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
              userType: undefined,
              emailAddress: {
                emailAddress: 'robot@stytch.com',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<OTPConfirmationScreen />);
      expect(screen.getByTestId('DividerWithText')).toBeTruthy();
      expect(screen.getByText('Create a password instead')).toBeTruthy();
    });
    it('When visible, the create password button sends a password reset when clicked', () => {
      const mocked = jest.fn();
      usePasswordsResetByEmailStartMock.mockReturnValue({
        resetPasswordByEmailStart: mocked,
      });
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
                emailAddress: 'robot@stytch.com',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<OTPConfirmationScreen />);
      fireEvent.press(screen.getByText('Create a password instead'));
      expect(mocked).toHaveBeenCalled();
    });
  });

  describe('Resend Dialog', () => {
    it('is not present by default', () => {
      render(DEFAULT_RENDER_PROPS)(<OTPConfirmationScreen />);
      expect(screen.queryByTestId('AlertDialog')).toBeFalsy();
    });
    it('is shown when you click resend code', () => {
      render(DEFAULT_RENDER_PROPS)(<OTPConfirmationScreen />);
      fireEvent.press(screen.getByTestId('ShowResendDialogButton'));
      expect(screen.getByTestId('AlertDialog')).toBeTruthy();
    });
    it('disappears when you press outside of the dialog', () => {
      render(DEFAULT_RENDER_PROPS)(<OTPConfirmationScreen />);
      fireEvent.press(screen.getByTestId('ShowResendDialogButton'));
      expect(screen.getByTestId('AlertDialog')).toBeTruthy();
      fireEvent.press(screen.getByTestId('DialogShade'));
      expect(screen.queryByTestId('AlertDialog')).toBeFalsy();
    });
    it('disappears when you click to cancel the dialog', () => {
      render(DEFAULT_RENDER_PROPS)(<OTPConfirmationScreen />);
      fireEvent.press(screen.getByTestId('ShowResendDialogButton'));
      expect(screen.getByTestId('AlertDialog')).toBeTruthy();
      fireEvent.press(screen.getByText('Cancel'));
      expect(screen.queryByTestId('AlertDialog')).toBeFalsy();
    });
    describe('For Email OTP', () => {
      it('resends the email code and closes the dialog when you click send code', () => {
        const props: ProviderProps = {
          ...DEFAULT_RENDER_PROPS,
          state: [
            {
              ...DEFAULT_RENDER_PROPS.state[0],
              authenticationState: {
                ...DEFAULT_RENDER_PROPS.state[0].authenticationState,
                otpMethod: 'email',
              },
            },
            DEFAULT_RENDER_PROPS.state[1],
          ],
        };
        const mocked = jest.fn();
        useOTPEmailLoginOrCreateMock.mockReturnValue({
          sendEmailOTP: mocked,
        });
        render(props)(<OTPConfirmationScreen />);
        fireEvent.press(screen.getByTestId('ShowResendDialogButton'));
        expect(screen.getByTestId('AlertDialog')).toBeTruthy();
        fireEvent.press(screen.getByText('Send code'));
        expect(screen.queryByTestId('AlertDialog')).toBeFalsy();
        expect(mocked).toHaveBeenCalled();
      });
    });
    describe('For SMS OTP', () => {
      it('resends the SMS code and closes the dialog when you click send code', () => {
        const props: ProviderProps = {
          ...DEFAULT_RENDER_PROPS,
          state: [
            {
              ...DEFAULT_RENDER_PROPS.state[0],
              authenticationState: {
                ...DEFAULT_RENDER_PROPS.state[0].authenticationState,
                otpMethod: 'sms',
              },
            },
            DEFAULT_RENDER_PROPS.state[1],
          ],
        };
        const mocked = jest.fn();
        useOTPSmsLoginOrCreateMock.mockReturnValue({
          sendSMSOTP: mocked,
        });
        render(props)(<OTPConfirmationScreen />);
        fireEvent.press(screen.getByTestId('ShowResendDialogButton'));
        expect(screen.getByTestId('AlertDialog')).toBeTruthy();
        fireEvent.press(screen.getByText('Send code'));
        expect(screen.queryByTestId('AlertDialog')).toBeFalsy();
        expect(mocked).toHaveBeenCalled();
      });
    });
    describe('For WhatsApp OTP', () => {
      it('resends the WhatsApp code and closes the dialog when you click send code', () => {
        const props: ProviderProps = {
          ...DEFAULT_RENDER_PROPS,
          state: [
            {
              ...DEFAULT_RENDER_PROPS.state[0],
              authenticationState: {
                ...DEFAULT_RENDER_PROPS.state[0].authenticationState,
                otpMethod: 'whatsapp',
              },
            },
            DEFAULT_RENDER_PROPS.state[1],
          ],
        };
        const mocked = jest.fn();
        useOTPWhatsappLoginOrCreateMock.mockReturnValue({
          sendWhatsAppOTP: mocked,
        });
        render(props)(<OTPConfirmationScreen />);
        fireEvent.press(screen.getByTestId('ShowResendDialogButton'));
        expect(screen.getByTestId('AlertDialog')).toBeTruthy();
        fireEvent.press(screen.getByText('Send code'));
        expect(screen.queryByTestId('AlertDialog')).toBeFalsy();
        expect(mocked).toHaveBeenCalled();
      });
    });
  });
});
