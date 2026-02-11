import React from 'react';
import { PasswordResetVerifyConfirmationScreen } from './PasswordResetVerifyConfirmationScreen';
import { render, screen, /*fireEvent,*/ DEFAULT_RENDER_PROPS, ProviderProps } from '../testUtils';

describe('PasswordResetVerifyConfirmationScreen', () => {
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
          },
        },
        DEFAULT_RENDER_PROPS.state[1],
      ],
    };
    render(props)(<PasswordResetVerifyConfirmationScreen />);
    expect(screen.getByText('Please verify your email')).toBeTruthy();
    //expect(screen.getByText('A login link was sent to you at robot@stytch.com.')).toBeTruthy();
  });
});
