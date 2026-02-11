import React from 'react';
import { useEmlLoginOrCreate } from '../hooks/emlLoginOrCreate';
import { usePasswordsResetByEmailStart } from '../hooks/passwordsResetByEmailStart';
import { EMLConfirmationScreen } from './EMLConfirmationScreen';
import { render, screen, fireEvent, DEFAULT_RENDER_PROPS, ProviderProps } from '../testUtils';
import { RNUIProducts } from '@stytch/core/public';

jest.mock('../hooks/emlLoginOrCreate');
const useEmlLoginOrCreateMock = jest.mocked(useEmlLoginOrCreate);
jest.mock('../hooks/passwordsResetByEmailStart');
const usePasswordsResetByEmailStartMock = jest.mocked(usePasswordsResetByEmailStart);

describe('EMLConfirmationScreen', () => {
  beforeAll(() => {
    useEmlLoginOrCreateMock.mockReturnValue({
      sendEML: jest.fn(),
    });
    usePasswordsResetByEmailStartMock.mockReturnValue({
      resetPasswordByEmailStart: jest.fn(),
    });
  });
  describe('For a new user with passwords enabled', () => {
    it('displays as expected', () => {
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
              emailAddress: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.emailAddress,
                emailAddress: 'robot@stytch.com',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<EMLConfirmationScreen />);
      expect(screen.getByTestId('EMLConfirmationScreen')).toBeTruthy();
      expect(screen.getByText('Check your email')).toBeTruthy();
      expect(screen.getByText('A login link was sent to you at robot@stytch.com.')).toBeTruthy();
      expect(screen.getByTestId('ShowResendDialogButton')).toBeTruthy();
      expect(screen.queryByTestId('DividerWithText')).toBeFalsy();
      expect(screen.queryByTestId('StytchTextButton')).toBeFalsy();
    });
  });
  describe('For a new user with passwords disabled', () => {
    it('displays as expected', () => {
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
              emailAddress: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.emailAddress,
                emailAddress: 'robot@stytch.com',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<EMLConfirmationScreen />);
      expect(screen.getByTestId('EMLConfirmationScreen')).toBeTruthy();
      expect(screen.getByText('Check your email')).toBeTruthy();
      expect(screen.getByText('A login link was sent to you at robot@stytch.com.')).toBeTruthy();
      expect(screen.getByTestId('ShowResendDialogButton')).toBeTruthy();
      expect(screen.queryByTestId('DividerWithText')).toBeFalsy();
      expect(screen.queryByTestId('StytchTextButton')).toBeFalsy();
    });
  });
  describe('For a password user with passwords enabled', () => {
    it('displays as expected', () => {
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
                ...DEFAULT_RENDER_PROPS.state[0].userState.emailAddress,
                emailAddress: 'robot@stytch.com',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<EMLConfirmationScreen />);
      expect(screen.getByTestId('EMLConfirmationScreen')).toBeTruthy();
      expect(screen.getByText('Check your email')).toBeTruthy();
      expect(screen.getByText('A login link was sent to you at robot@stytch.com.')).toBeTruthy();
      expect(screen.getByTestId('ShowResendDialogButton')).toBeTruthy();
      expect(screen.getByTestId('DividerWithText')).toBeTruthy();
      expect(screen.getByTestId('StytchTextButton')).toBeTruthy();
    });
  });
  describe('For a password user with passwords disabled', () => {
    it('displays as expected', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              userType: 'password',
              emailAddress: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.emailAddress,
                emailAddress: 'robot@stytch.com',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<EMLConfirmationScreen />);
      expect(screen.getByTestId('EMLConfirmationScreen')).toBeTruthy();
      expect(screen.getByText('Check your email')).toBeTruthy();
      expect(screen.getByText('A login link was sent to you at robot@stytch.com.')).toBeTruthy();
      expect(screen.getByTestId('ShowResendDialogButton')).toBeTruthy();
      expect(screen.queryByTestId('DividerWithText')).toBeFalsy();
      expect(screen.queryByTestId('StytchTextButton')).toBeFalsy();
    });
  });
  describe('For a passwordless user with passwords enabled', () => {
    it('displays as expected', () => {
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
                emailAddress: 'robot@stytch.com',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<EMLConfirmationScreen />);
      expect(screen.getByTestId('EMLConfirmationScreen')).toBeTruthy();
      expect(screen.getByText('Check your email')).toBeTruthy();
      expect(screen.getByText('A login link was sent to you at robot@stytch.com.')).toBeTruthy();
      expect(screen.getByTestId('ShowResendDialogButton')).toBeTruthy();
      expect(screen.getByTestId('DividerWithText')).toBeTruthy();
      expect(screen.getByTestId('StytchTextButton')).toBeTruthy();
    });
  });
  describe('For a passwordless user with passwords disabled', () => {
    it('displays as expected', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              userType: 'passwordless',
              emailAddress: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.emailAddress,
                emailAddress: 'robot@stytch.com',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<EMLConfirmationScreen />);
      expect(screen.getByTestId('EMLConfirmationScreen')).toBeTruthy();
      expect(screen.getByText('Check your email')).toBeTruthy();
      expect(screen.getByText('A login link was sent to you at robot@stytch.com.')).toBeTruthy();
      expect(screen.getByTestId('ShowResendDialogButton')).toBeTruthy();
      expect(screen.queryByTestId('DividerWithText')).toBeFalsy();
      expect(screen.queryByTestId('StytchTextButton')).toBeFalsy();
    });
  });
  describe('Create A Password button', () => {
    it('Launches the reset password flow', () => {
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
              userType: 'passwordless',
              emailAddress: {
                ...DEFAULT_RENDER_PROPS.state[0].userState.emailAddress,
                emailAddress: 'robot@stytch.com',
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<EMLConfirmationScreen />);
      expect(screen.getByTestId('StytchTextButton')).toBeTruthy();
      fireEvent.press(screen.getByTestId('StytchTextButton'));
      expect(mocked).toHaveBeenCalled();
    });
  });
  describe('ResendDialog', () => {
    it('is not present by default', () => {
      render(DEFAULT_RENDER_PROPS)(<EMLConfirmationScreen />);
      expect(screen.queryByTestId('AlertDialog')).toBeFalsy();
    });
    it('is shown when you click resend link', () => {
      render(DEFAULT_RENDER_PROPS)(<EMLConfirmationScreen />);
      fireEvent.press(screen.getByTestId('ShowResendDialogButton'));
      expect(screen.getByTestId('AlertDialog')).toBeTruthy();
    });
    it('disappears when you press outside of the dialog', () => {
      render(DEFAULT_RENDER_PROPS)(<EMLConfirmationScreen />);
      fireEvent.press(screen.getByTestId('ShowResendDialogButton'));
      expect(screen.getByTestId('AlertDialog')).toBeTruthy();
      fireEvent.press(screen.getByTestId('DialogShade'));
      expect(screen.queryByTestId('AlertDialog')).toBeFalsy();
    });
    it('disappears when you click to cancel the dialog', () => {
      render(DEFAULT_RENDER_PROPS)(<EMLConfirmationScreen />);
      fireEvent.press(screen.getByTestId('ShowResendDialogButton'));
      expect(screen.getByTestId('AlertDialog')).toBeTruthy();
      fireEvent.press(screen.getByText('Cancel'));
      expect(screen.queryByTestId('AlertDialog')).toBeFalsy();
    });
    it('resends the EML and closes the dialog when you click send link', () => {
      const mocked = jest.fn();
      useEmlLoginOrCreateMock.mockReturnValue({
        sendEML: mocked,
      });
      render(DEFAULT_RENDER_PROPS)(<EMLConfirmationScreen />);
      fireEvent.press(screen.getByTestId('ShowResendDialogButton'));
      expect(screen.getByTestId('AlertDialog')).toBeTruthy();
      fireEvent.press(screen.getByText('Send link'));
      expect(screen.queryByTestId('AlertDialog')).toBeFalsy();
      expect(mocked).toHaveBeenCalled();
    });
  });
});
