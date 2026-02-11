import React from 'react';

import { DEFAULT_RENDER_PROPS, ProviderProps, render, screen /*fireEvent,*/ } from '../testUtils';
import { RecoveryCodeEntryScreen } from './RecoveryCodeEntryScreen';

describe('RecoveryCodeEntryScreen', () => {
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
    render(props)(<RecoveryCodeEntryScreen />);
    expect(screen.getByText('Enter backup code')).toBeTruthy();
    expect(
      screen.getByText('Enter one of the backup codes you saved when setting up your authenticator app.'),
    ).toBeTruthy();
  });
});
