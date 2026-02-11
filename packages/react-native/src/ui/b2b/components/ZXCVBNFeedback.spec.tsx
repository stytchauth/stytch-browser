import React from 'react';
import { render, DEFAULT_RENDER_PROPS, screen } from '../testUtils';
import { ZXCVBNFeedback } from './ZXCVBNFeedback';

describe('ZXCVBNFeedback', () => {
  it('displays the correct number of cells', () => {
    render(DEFAULT_RENDER_PROPS)(<ZXCVBNFeedback score={3} suggestions={[]} />);
    expect(screen.getAllByTestId('ZXCVBNCell')).toHaveLength(4);
  });
  it('displays the suggestions if there are any', () => {
    render(DEFAULT_RENDER_PROPS)(<ZXCVBNFeedback score={0} suggestions={['Suggestion 1', 'Suggestion 2']} />);
    expect(screen.getByText('Suggestion 1, Suggestion 2')).toBeTruthy();
  });
  it('displays the success message if score is 3', () => {
    render(DEFAULT_RENDER_PROPS)(<ZXCVBNFeedback score={3} suggestions={['Suggestion 1', 'Suggestion 2']} />);
    expect(screen.queryByText('Suggestion 1, Suggestion 2')).toBeFalsy();
    expect(screen.getByText('Great job! This is a strong password.')).toBeTruthy();
  });
});
