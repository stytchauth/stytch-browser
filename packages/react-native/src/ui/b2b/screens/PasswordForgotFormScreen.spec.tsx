import React from 'react';

import { usePasswordResetByEmailStart } from '../hooks/usePasswordResetByEmailStart';
import { DEFAULT_RENDER_PROPS, ProviderProps, render, screen /*fireEvent,*/ } from '../testUtils';
import { PasswordForgotFormScreen } from './PasswordForgotFormScreen';

jest.mock('../hooks/usePasswordResetByEmailStart');
const usePasswordResetByEmailStartMock = jest.mocked(usePasswordResetByEmailStart);

describe('PasswordForgotFormScreen', () => {
  beforeAll(() => {
    usePasswordResetByEmailStartMock.mockReturnValue({
      passwordResetByEmailStart: jest.fn(),
    });
  });
  it('Renders with correct content', () => {
    const props: ProviderProps = {
      ...DEFAULT_RENDER_PROPS,
      state: [
        {
          ...DEFAULT_RENDER_PROPS.state[0],
        },
        DEFAULT_RENDER_PROPS.state[1],
      ],
    };
    render(props)(<PasswordForgotFormScreen />);
    expect(screen.getByText('Check your email for help signing in')).toBeTruthy();
    expect(
      screen.getByText(
        "We'll email you a login link to sign in to your account directly or reset your password if you have one.",
      ),
    ).toBeTruthy();
  });
});
