import React from 'react';

import { DEFAULT_RENDER_PROPS, ProviderProps, render, screen /*fireEvent,*/ } from '../testUtils';
import { MFAEnrollmentSelectionScreen } from './MFAEnrollmentSelectionScreen';

describe('MFAEnrollmentSelectionScreen', () => {
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
    render(props)(<MFAEnrollmentSelectionScreen />);
    expect(screen.getByText('Set up Multi-Factor Authentication')).toBeTruthy();
  });
});
