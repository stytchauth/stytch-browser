import React from 'react';

import { usePasswordsStrengthCheck } from '../hooks/passwordsStrengthCheck';
import { useUpdateMemberPassword } from '../hooks/updateMemberPassword';
import { MOCK_MEMBER, MOCK_ORGANIZATION } from '../mocks';
import { DEFAULT_RENDER_PROPS, fireEvent, ProviderProps, render, screen } from '../testUtils';
import { PasswordEntryForm } from './PasswordEntryForm';

jest.mock('../hooks/updateMemberPassword');
const useUpdateMemberPasswordMock = jest.mocked(useUpdateMemberPassword);
jest.mock('../hooks/passwordsStrengthCheck');
const usePasswordsStrengthCheckMock = jest.mocked(usePasswordsStrengthCheck);

describe('PasswordEntryForm', () => {
  beforeAll(() => {
    useUpdateMemberPasswordMock.mockReturnValue({
      setMemberPassword: jest.fn(),
    });
    usePasswordsStrengthCheckMock.mockReturnValue({
      checkPasswordStrength: jest.fn(),
    });
  });
  it('Displays password input', () => {
    render(DEFAULT_RENDER_PROPS)(<PasswordEntryForm />);
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
  });
  it('Calls setMemberpassword hook when text changes', () => {
    const mocked = jest.fn();
    useUpdateMemberPasswordMock.mockReturnValue({
      setMemberPassword: mocked,
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
            memberState: {
              ...DEFAULT_RENDER_PROPS.state[0].memberState,
              password: {
                passwordStrengthCheckResponse: {
                  request_id: '',
                  status_code: 200,
                  member_id: '',
                  member: MOCK_MEMBER,
                  organization: MOCK_ORGANIZATION,
                  valid_password: true,
                  score: 3,
                  breached_password: false,
                  breach_detection_on_create: false,
                  strength_policy: 'luds',
                  zxcvbn_feedback: {
                    suggestions: [],
                    warning: '',
                  },
                  luds_feedback: {
                    has_lower_case: true,
                    has_upper_case: true,
                    has_digit: true,
                    has_symbol: true,
                    missing_complexity: 0,
                    missing_characters: 0,
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
            memberState: {
              ...DEFAULT_RENDER_PROPS.state[0].memberState,
              password: {
                passwordStrengthCheckResponse: {
                  request_id: '',
                  status_code: 200,
                  member_id: '',
                  member: MOCK_MEMBER,
                  organization: MOCK_ORGANIZATION,
                  valid_password: true,
                  score: 3,
                  breached_password: false,
                  breach_detection_on_create: false,
                  strength_policy: 'zxcvbn',
                  zxcvbn_feedback: {
                    suggestions: [],
                    warning: '',
                  },
                  luds_feedback: {
                    has_lower_case: true,
                    has_upper_case: true,
                    has_digit: true,
                    has_symbol: true,
                    missing_complexity: 0,
                    missing_characters: 0,
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
            memberState: {
              ...DEFAULT_RENDER_PROPS.state[0].memberState,
              password: {
                passwordStrengthCheckResponse: {
                  request_id: '',
                  status_code: 200,
                  member_id: '',
                  member: MOCK_MEMBER,
                  organization: MOCK_ORGANIZATION,
                  valid_password: true,
                  score: 3,
                  breached_password: true,
                  breach_detection_on_create: false,
                  strength_policy: 'luds',
                  zxcvbn_feedback: {
                    suggestions: [],
                    warning: '',
                  },
                  luds_feedback: {
                    has_lower_case: true,
                    has_upper_case: true,
                    has_digit: true,
                    has_symbol: true,
                    missing_complexity: 0,
                    missing_characters: 0,
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
