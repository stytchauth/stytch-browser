import React from 'react';
import { render, DEFAULT_RENDER_PROPS, screen, fireEvent, flushPromises, waitFor } from '../testUtils';
import { useOTPSMSAuthenticate } from '../hooks/useOTPSMSAuthenticate';
import { AuthType, CodeEntry } from './CodeEntry';

jest.mock('../hooks/useOTPSMSAuthenticate');
const otpSMSAuthenticateMock = jest.mocked(useOTPSMSAuthenticate);

describe('OTPEntry', () => {
  beforeAll(() => {
    otpSMSAuthenticateMock.mockReturnValue({
      otpSMSAuthenticate: jest.fn(),
    });
  });
  it('Renders as expected', () => {
    render(DEFAULT_RENDER_PROPS)(<CodeEntry authType={AuthType.OTP_SMS} />);
    expect(screen.getAllByTestId('StytchInput')).toHaveLength(6);
    expect(screen.queryByTestId('FormFieldError')).toBeFalsy();
  });
  it('calls authenticate hook when 6 numbers are entered', () => {
    const mocked = jest.fn().mockResolvedValue('');
    otpSMSAuthenticateMock.mockReturnValue({
      otpSMSAuthenticate: mocked,
    });
    render(DEFAULT_RENDER_PROPS)(<CodeEntry authType={AuthType.OTP_SMS} />);
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
    otpSMSAuthenticateMock.mockReturnValue({
      otpSMSAuthenticate: mocked,
    });
    render(DEFAULT_RENDER_PROPS)(<CodeEntry authType={AuthType.OTP_SMS} />);
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
