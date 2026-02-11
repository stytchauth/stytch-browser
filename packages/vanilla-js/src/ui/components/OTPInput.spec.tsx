import React from 'react';
import { OTPInput } from './OTPInput';
import { render, screen } from '../../testUtils';
import userEvent from '@testing-library/user-event';

describe('OTP Input Component', () => {
  it('should have an input field', () => {
    const mockSetOtp = jest.fn();
    render(<OTPInput otp={''} setOtp={mockSetOtp} />);
    const inputElements = screen.getAllByLabelText('One-time passcode');
    expect(inputElements.length).toBe(1);
  });

  it('should handle an OTP being inputted', async () => {
    const mockSetOtp = jest.fn();
    render(<OTPInput otp={''} setOtp={mockSetOtp} />);
    const inputElement = screen.getByLabelText('One-time passcode');
    await userEvent.type(inputElement, '123456');
    expect(mockSetOtp).toHaveBeenCalledTimes(6);
    expect(mockSetOtp).toHaveBeenCalledWith('123456');
  });

  it('should display some digits if inputted', async () => {
    const mockSetOtp = jest.fn();
    const otpVal = '123';
    render(<OTPInput otp={otpVal} setOtp={mockSetOtp} />);

    for (let i = 0; i < otpVal.length; i++) {
      const elem = screen.getByTestId(`otp-${i}`);
      expect(elem.textContent).toBe(otpVal.charAt(i));
    }
  });

  it('should display all digits if inputted', async () => {
    const mockSetOtp = jest.fn();
    const otpVal = '123456';
    render(<OTPInput otp={otpVal} setOtp={mockSetOtp} />);

    for (let i = 0; i < otpVal.length; i++) {
      const elem = screen.getByTestId(`otp-${i}`);
      expect(elem.textContent).toBe(otpVal.charAt(i));
    }
  });

  it('should not accept non-numeric values', async () => {
    const mockSetOtp = jest.fn();
    render(<OTPInput otp={''} setOtp={mockSetOtp} />);
    const inputElement = screen.getByLabelText('One-time passcode');
    await userEvent.type(inputElement, 'a');
    expect(mockSetOtp).toHaveBeenCalledTimes(0);
  });
});
