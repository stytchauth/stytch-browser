import React from 'react';
import { usePasswordsResetByEmail } from '../hooks/passwordsResetByEmail';
import { SetPasswordScreen } from './SetPasswordScreen';
import { render, screen, fireEvent, DEFAULT_RENDER_PROPS, ProviderProps } from '../testUtils';

jest.mock('../hooks/passwordsResetByEmail');
const usePasswordsResetByEmailMock = jest.mocked(usePasswordsResetByEmail);

describe('SetPasswordScreen', () => {
  beforeAll(() => {
    usePasswordsResetByEmailMock.mockReturnValue({
      resetPasswordByEmail: jest.fn(),
    });
  });
  it('Renders as expected', () => {
    render(DEFAULT_RENDER_PROPS)(<SetPasswordScreen />);
    expect(screen.getByText('Set a new password')).toBeTruthy();
    expect(screen.getByTestId('EmailEntryForm')).toBeTruthy();
    expect(screen.getByTestId('PasswordEntryForm')).toBeTruthy();
    expect(screen.getByTestId('StytchButton')).toBeTruthy();
  });
  describe('Clicking the button', () => {
    it('Does nothing if not enabled', () => {
      const mocked = jest.fn();
      usePasswordsResetByEmailMock.mockReturnValue({
        resetPasswordByEmail: mocked,
      });
      render(DEFAULT_RENDER_PROPS)(<SetPasswordScreen />);
      fireEvent.press(screen.getByTestId('StytchButton'));
      expect(mocked).not.toHaveBeenCalled();
    });
    it('Resends the password reset email when enabled', () => {
      const mocked = jest.fn();
      usePasswordsResetByEmailMock.mockReturnValue({
        resetPasswordByEmail: mocked,
      });
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
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
      render(props)(<SetPasswordScreen />);
      fireEvent.press(screen.getByTestId('StytchButton'));
      expect(mocked).toHaveBeenCalled();
    });
  });
});
