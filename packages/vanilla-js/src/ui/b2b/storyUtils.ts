import { expect, userEvent, waitFor, within } from '@storybook/test';

export type Canvas = ReturnType<
  typeof within<
    typeof import('@testing-library/dom/types/queries'),
    typeof import('@testing-library/dom/types/queries')
  >
>;

export const getBackButton = (canvas: Canvas) => canvas.getByRole('button', { name: 'Back' });

export const completeSmsOtpEnrollment = async (canvas: Canvas) => {
  await waitFor(() =>
    expect(canvas.getByText('Enter your phone number to set up Multi-Factor Authentication')).toBeInTheDocument(),
  );
  await userEvent.type(canvas.getByRole('textbox'), '5005550006', { delay: 10 });
  const submitButton = canvas.getByRole('button', { name: 'Continue' });
  await waitFor(() => expect(submitButton).toBeEnabled());
  await userEvent.click(submitButton);
};
