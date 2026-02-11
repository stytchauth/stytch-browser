import React from 'react';
import { MFAEnrollmentSelectionScreen } from './MFAEnrollmentSelectionScreen';
import { render, screen, /*fireEvent,*/ DEFAULT_RENDER_PROPS, ProviderProps } from '../testUtils';

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
