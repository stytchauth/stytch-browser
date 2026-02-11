import React from 'react';

import { useOTPAuthenticate } from '../hooks/otpAuthenticate';
import { DEFAULT_RENDER_PROPS, fireEvent, flushPromises, render, screen, waitFor } from '../testUtils';
import { OTPEntry } from './OTPEntry';

jest.mock('../hooks/otpAuthenticate');
const useOTPAuthenticateMock = jest.mocked(useOTPAuthenticate);

describe('OTPEntry', () => {
  beforeAll(() => {
    useOTPAuthenticateMock.mockReturnValue({
      authenticateOTP: jest.fn(),
    });
  });
  it('Renders as expected', () => {
    render(DEFAULT_RENDER_PROPS)(<OTPEntry />);
    expect(screen.getAllByTestId('StytchInput')).toHaveLength(6);
    expect(screen.queryByTestId('FormFieldError')).toBeFalsy();
  });
  it('calls authenticate hook when 6 numbers are entered', () => {
    const mocked = jest.fn().mockResolvedValue('');
    useOTPAuthenticateMock.mockReturnValue({
      authenticateOTP: mocked,
    });
    render(DEFAULT_RENDER_PROPS)(<OTPEntry />);
    fireEvent.changeText(screen.getAllByTestId('StytchInput')[0], '1');
    expect(mocked).not.toHaveBeenCalled();
    fireEvent.changeText(screen.getAllByTestId('StytchInput')[1], '1');
    expect(mocked).not.toHaveBeenCalled();
    fireEvent.changeText(screen.getAllByTestId('StytchInput')[2], '1');
    expect(mocked).not.toHaveBeenCalled();
    fireEvent.changeText(screen.getAllByTestId('StytchInput')[3], '1');
    expect(mocked).not.toHaveBeenCalled();
    fireEvent.changeText(screen.getAllByTestId('StytchInput')[4], '1');
    expect(mocked).not.toHaveBeenCalled();
    fireEvent.changeText(screen.getAllByTestId('StytchInput')[5], '1');
    expect(mocked).toHaveBeenCalled();
  });
  it('displays error when code is invalid', async () => {
    const mocked = jest.fn().mockRejectedValue(new Error());
    useOTPAuthenticateMock.mockReturnValue({
      authenticateOTP: mocked,
    });
    render(DEFAULT_RENDER_PROPS)(<OTPEntry />);
    fireEvent.changeText(screen.getAllByTestId('StytchInput')[0], '1');
    fireEvent.changeText(screen.getAllByTestId('StytchInput')[1], '1');
    fireEvent.changeText(screen.getAllByTestId('StytchInput')[2], '1');
    fireEvent.changeText(screen.getAllByTestId('StytchInput')[3], '1');
    fireEvent.changeText(screen.getAllByTestId('StytchInput')[4], '1');
    fireEvent.changeText(screen.getAllByTestId('StytchInput')[5], '1');
    expect(mocked).toHaveBeenCalled();
    await flushPromises();
    await waitFor(() => {
      screen.getByTestId('FormFieldError');
    });
  });
});
