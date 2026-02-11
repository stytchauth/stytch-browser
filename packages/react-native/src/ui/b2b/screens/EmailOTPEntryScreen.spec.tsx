import React from 'react';

import { DEFAULT_RENDER_PROPS, ProviderProps, render, screen /*fireEvent,*/ } from '../testUtils';
import { EmailOTPEntryScreen } from './EmailOTPEntryScreen';

describe('EmailOTPEntryScreen', () => {
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
    render(props)(<EmailOTPEntryScreen />);
    expect(screen.getByText('Enter verification code')).toBeTruthy();
    expect(screen.getByText('A 6-digit passcode was sent to you at robot@stytch.com.')).toBeTruthy();
  });
});
