import React from 'react';
import { SMSOTPEntryScreen } from './SMSOTPEntryScreen';
import { render, screen, /*fireEvent,*/ DEFAULT_RENDER_PROPS, ProviderProps } from '../testUtils';

describe('SMSOTPEntryScreen', () => {
  it('Renders with correct content', () => {
    const props: ProviderProps = {
      ...DEFAULT_RENDER_PROPS,
      state: [
        {
          ...DEFAULT_RENDER_PROPS.state[0],
          authenticationState: {
            ...DEFAULT_RENDER_PROPS.state[0].authenticationState,
            otpMethod: 'sms',
          },
          mfaState: {
            ...DEFAULT_RENDER_PROPS.state[0].mfaState,
            smsOtp: {
              ...DEFAULT_RENDER_PROPS.state[0].mfaState.smsOtp,
              enrolledNumber: {
                countryCode: '+1',
                phoneNumber: '5005550006',
              },
            },
          },
        },
        DEFAULT_RENDER_PROPS.state[1],
      ],
    };
    render(props)(<SMSOTPEntryScreen />);
    expect(screen.getByText('Enter passcode')).toBeTruthy();
    expect(screen.getByText('A 6-digit passcode was sent to you at (500) 555-0006.')).toBeTruthy();
  });
});
