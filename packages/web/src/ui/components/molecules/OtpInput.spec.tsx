import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '../../../testUtils';
import OtpInput from './OtpInput';

describe('OtpInput Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have an input field', () => {
    render(<OtpInput onSubmit={mockOnSubmit} />);
    screen.getByLabelText('One-time passcode');
  });

  it('should call onSubmit when OTP is complete', async () => {
    render(<OtpInput onSubmit={mockOnSubmit} />);
    const inputElement = screen.getByLabelText('One-time passcode');
    await userEvent.type(inputElement, '123456');
    expect(mockOnSubmit).toHaveBeenCalledWith('123456');
  });

  it('should display default OTP if provided', () => {
    render(<OtpInput onSubmit={mockOnSubmit} defaultOtp="123456" />);

    // Check that all 6 digits are displayed
    const slots = screen.getAllByText(/[0-9]/);
    expect(slots.map((ele) => ele.textContent)).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('should not accept non-numeric values', async () => {
    render(<OtpInput onSubmit={mockOnSubmit} />);
    const inputElement = screen.getByLabelText('One-time passcode');
    await userEvent.type(inputElement, '00000a');
    // Non-numeric values should be filtered out
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should handle disabled state', () => {
    render(<OtpInput onSubmit={mockOnSubmit} defaultOtp="123456" disabled />);
    const inputElement = screen.getByLabelText<HTMLInputElement>('One-time passcode');
    expect(inputElement.disabled).toBe(true);
  });

  it('should limit input to 6 digits', async () => {
    render(<OtpInput onSubmit={mockOnSubmit} />);
    const inputElement = screen.getByLabelText('One-time passcode');
    await userEvent.type(inputElement, '1234567890');
    expect(mockOnSubmit).toHaveBeenCalledWith('123456');
  });

  it('should handle backspace correctly', async () => {
    render(<OtpInput onSubmit={mockOnSubmit} defaultOtp="123456" />);
    const inputElement = screen.getByLabelText('One-time passcode');
    await userEvent.type(inputElement, '{backspace}');
    // After backspace, OTP should be incomplete, so onSubmit shouldn't be called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should handle paste correctly', async () => {
    render(<OtpInput onSubmit={mockOnSubmit} />);
    const inputElement = screen.getByLabelText('One-time passcode');
    await userEvent.click(inputElement);
    await userEvent.paste('123456');
    expect(mockOnSubmit).toHaveBeenCalledWith('123456');
  });

  // There should be a test to test paste transformer here but it doesn't work lol
});
