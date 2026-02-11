import React from 'react';

import { usePasswordResetByEmail } from '../hooks/usePasswordResetByEmail';
import { DEFAULT_RENDER_PROPS, ProviderProps, render, screen /*fireEvent,*/ } from '../testUtils';
import { PasswordResetFormScreen } from './PasswordResetFormScreen';

jest.mock('../hooks/usePasswordResetByEmail');
const usePasswordResetByEmailMock = jest.mocked(usePasswordResetByEmail);

describe('PasswordResetFormScreen', () => {
  beforeAll(() => {
    usePasswordResetByEmailMock.mockReturnValue({
      passwordResetByEmail: jest.fn(),
    });
  });
  it('Renders with correct content', () => {
    const props: ProviderProps = {
      ...DEFAULT_RENDER_PROPS,
      state: [
        {
          ...DEFAULT_RENDER_PROPS.state[0],
          memberState: {
            ...DEFAULT_RENDER_PROPS.state[0].memberState,
            emailAddress: {
              ...DEFAULT_RENDER_PROPS.state[0].memberState.emailAddress,
              emailAddress: 'robot@stytch.com',
            },
            password: {
              ...DEFAULT_RENDER_PROPS.state[0].memberState.password,
              resetType: 'breached',
            },
          },
        },
        DEFAULT_RENDER_PROPS.state[1],
      ],
    };
    render(props)(<PasswordResetFormScreen />);
    expect(screen.getByText('Set a new password')).toBeTruthy();
  });
});
