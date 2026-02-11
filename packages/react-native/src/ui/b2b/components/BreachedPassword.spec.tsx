import React from 'react';
import { DEFAULT_RENDER_PROPS, render, screen } from '../testUtils';
import { BreachedPassword } from './BreachedPassword';

describe('Breached Password', () => {
  it('renders as expected', () => {
    render(DEFAULT_RENDER_PROPS)(<BreachedPassword />);
    expect(screen.getByTestId('CrossImage')).toBeTruthy();
    expect(screen.getByTestId('FormFieldError')).toBeTruthy();
  });
});
