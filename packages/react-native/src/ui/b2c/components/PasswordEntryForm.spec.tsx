import React from 'react';
import { PasswordEntryForm } from './PasswordEntryForm';
import { render, DEFAULT_RENDER_PROPS, screen, fireEvent, ProviderProps } from '../testUtils';
import { useUpdateUserPassword } from '../hooks/updateUserPassword';
import { usePasswordsStrengthCheck } from '../hooks/passwordsStrengthCheck';

jest.mock('../hooks/updateUserPassword');
const useUpdateUserPasswordMock = jest.mocked(useUpdateUserPassword);
jest.mock('../hooks/passwordsStrengthCheck');
const usePasswordsStrengthCheckMock = jest.mocked(usePasswordsStrengthCheck);

describe('PasswordEntryForm', () => {
  beforeAll(() => {
    useUpdateUserPasswordMock.mockReturnValue({
      setUserPassword: jest.fn(),
    });
    usePasswordsStrengthCheckMock.mockReturnValue({
      checkPasswordStrength: jest.fn(),
    });
  });
  it('Displays password input', () => {
    render(DEFAULT_RENDER_PROPS)(<PasswordEntryForm />);
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
  });
  it('Calls setuserpassword hook when text changes', () => {
    const mocked = jest.fn();
    useUpdateUserPasswordMock.mockReturnValue({
      setUserPassword: mocked,
    });
    render(DEFAULT_RENDER_PROPS)(<PasswordEntryForm />);
    fireEvent.changeText(screen.getByTestId('StytchInput'), 'my cool password');
    expect(mocked).toHaveBeenCalledWith('my cool password');
  });
  describe('For LUDS', () => {
    it('Displays LUDSFeedback', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              password: {
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
      render(props)(<PasswordEntryForm />);
      expect(screen.getByTestId('LUDSFeedback')).toBeTruthy();
    });
  });
  describe('For ZXCVBN', () => {
    it('Displays LUDSFeedback', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              password: {
                passwordStrengthCheckResponse: {
                  score: 3,
                  breached_password: false,
                  valid_password: true,
                  request_id: '',
                  status_code: 200,
                  breach_detection_on_create: false,
                  strength_policy: 'zxcvbn',
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
      render(props)(<PasswordEntryForm />);
      expect(screen.getByTestId('ZXCVBNFeedback')).toBeTruthy();
    });
  });
  describe('For Breached password', () => {
    it('Displays BreachedPassword', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              password: {
                passwordStrengthCheckResponse: {
                  score: 3,
                  breached_password: true,
                  valid_password: true,
                  request_id: '',
                  status_code: 200,
                  breach_detection_on_create: false,
                  strength_policy: 'zxcvbn',
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
      render(props)(<PasswordEntryForm />);
      expect(screen.getByTestId('BreachedPassword')).toBeTruthy();
    });
  });
});
