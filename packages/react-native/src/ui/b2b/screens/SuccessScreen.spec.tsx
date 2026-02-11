import React from 'react';

import { DEFAULT_RENDER_PROPS, ProviderProps, render, screen } from '../testUtils';
import { SuccessScreen } from './SuccessScreen';

describe('SuccessScreen', () => {
  it('renders', () => {
    const view: ProviderProps = DEFAULT_RENDER_PROPS;
    render(view)(<SuccessScreen />);
    expect(screen.getByTestId(`SuccessScreen`)).toBeTruthy();
  });
});
