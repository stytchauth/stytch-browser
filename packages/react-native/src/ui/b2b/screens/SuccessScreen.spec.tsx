import React from 'react';
import { SuccessScreen } from './SuccessScreen';
import { render, screen, DEFAULT_RENDER_PROPS, ProviderProps } from '../testUtils';

describe('SuccessScreen', () => {
  it('renders', () => {
    const view: ProviderProps = DEFAULT_RENDER_PROPS;
    render(view)(<SuccessScreen />);
    expect(screen.getByTestId(`SuccessScreen`)).toBeTruthy();
  });
});
