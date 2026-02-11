import React from 'react';

import { DEFAULT_RENDER_PROPS, ProviderProps, render, screen /*fireEvent,*/ } from '../testUtils';
import { EmailMethodSelectionScreen } from './EmailMethodSelectionScreen';

describe('EmailMethodSelectionScreen', () => {
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
    render(props)(<EmailMethodSelectionScreen />);
    expect(screen.getByText("Select how you'd like to continue.")).toBeTruthy();
  });
});
