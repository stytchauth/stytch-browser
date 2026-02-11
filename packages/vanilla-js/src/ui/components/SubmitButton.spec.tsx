import React from 'react';
import { render, screen } from '../../testUtils';
import { SubmitButton } from './SubmitButton';

describe('SubmitButton', () => {
  it("should display 'Continue with email' initially", () => {
    const { container } = render(<SubmitButton isSubmitting={false} text={'Continue with email'} />);
    expect(container.textContent).toMatch('Continue with email');
  });

  it('should display loading image while submitting', async () => {
    render(<SubmitButton isSubmitting={true} text={'Submit'} />);
    const loadingIcon = screen.queryByTestId('loading-icon');
    expect(loadingIcon).toBeDefined();
  });
});
