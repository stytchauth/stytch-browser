import { OTPMethods, StytchAPIError } from '@stytch/core/public';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { messages } from '../../messages/en';
import {
  act,
  MockClient,
  MockConfig,
  MockGlobalContextProvider,
  MockState,
  render,
  screen,
  waitFor,
} from '../../testUtils';
import * as internals from '../../utils/internal';
import { B2CInternals } from '../../utils/internal';
import Container from '../b2c/Container';
import * as Products from '../b2c/Products';
import { I18nProviderWrapper } from '../components/atoms/I18nProviderWrapper';

const MOCK_METHOD = 'method-1234';
const MOCK_PHONE = '5176553515';
const MOCK_PHONE_E164 = '+15176553515';
const MOCK_EMAIL = 'example@email.com';
const MOCK_OTP = '123456';

const MOCK_PARSED_PHONE_NUMBER = {
  isValid: true,
  number: MOCK_PHONE_E164,
  national: MOCK_PHONE,
};

const mockReadInternals = jest.spyOn(internals, 'readB2CInternals');
mockReadInternals.mockImplementation(
  () =>
    ({
      clientsideServices: {
        parsedPhoneNumber: jest.fn().mockResolvedValueOnce(MOCK_PARSED_PHONE_NUMBER),
      },
    }) as unknown as B2CInternals,
);

describe('OTP Flow', () => {
  const renderAppWithConfig = (config?: MockConfig, state?: MockState, client?: MockClient) => {
    return render(
      <MockGlobalContextProvider config={config} state={state} client={client}>
        <I18nProviderWrapper messages={messages}>
          <Container />
        </I18nProviderWrapper>
      </MockGlobalContextProvider>,
    );
  };

  it('Successfully handles a sms otp login', async () => {
    const config: MockConfig = {
      products: [Products.otp],
      sessionOptions: {
        sessionDurationMinutes: 60,
      },
      otpOptions: {
        expirationMinutes: 10,
        methods: [OTPMethods.SMS],
      },
    };

    const client: MockClient = {
      otps: {
        authenticate: jest.fn().mockResolvedValue(void 0),
        sms: {
          loginOrCreate: jest.fn().mockResolvedValue({ method_id: MOCK_METHOD }),
        },
      },
    };

    renderAppWithConfig(config, undefined, client);

    await userEvent.type(screen.getByPlaceholderText('(201) 555-0123'), MOCK_PHONE);

    await waitFor(async () => {
      screen.getByText('Continue with text message');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Continue with text message' }));

    await waitFor(async () => {
      screen.getByText('Enter passcode');
    });

    await userEvent.type(screen.getByLabelText('One-time passcode'), MOCK_OTP);

    await waitFor(async () => {
      screen.getByText('Your passcode has been successfully verified.');
    });

    expect(client.otps?.sms?.loginOrCreate).toHaveBeenCalledTimes(1);
    expect(client.otps?.sms?.loginOrCreate).toHaveBeenCalledWith(MOCK_PHONE_E164, {
      expiration_minutes: config?.otpOptions?.expirationMinutes,
    });
    expect(client.otps?.authenticate).toHaveBeenCalledTimes(1);
    expect(client.otps?.authenticate).toHaveBeenCalledWith(MOCK_OTP, MOCK_METHOD, {
      session_duration_minutes: config?.sessionOptions?.sessionDurationMinutes,
    });
  });

  it('Successfully handles a whatsapp otp login', async () => {
    const config: MockConfig = {
      products: [Products.otp],
      sessionOptions: {
        sessionDurationMinutes: 60,
      },
      otpOptions: {
        expirationMinutes: 10,
        methods: [OTPMethods.WhatsApp],
      },
    };

    const client: MockClient = {
      otps: {
        authenticate: jest.fn().mockResolvedValue(void 0),
        whatsapp: {
          loginOrCreate: jest.fn().mockResolvedValue({ method_id: MOCK_METHOD }),
        },
      },
    };

    renderAppWithConfig(config, undefined, client);

    await userEvent.type(screen.getByPlaceholderText('(201) 555-0123'), MOCK_PHONE);

    await waitFor(async () => {
      screen.getByText('Continue with WhatsApp');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Continue with WhatsApp' }));

    await waitFor(async () => {
      screen.getByText('Enter passcode');
    });

    await userEvent.type(screen.getByLabelText('One-time passcode'), MOCK_OTP);

    await waitFor(async () => {
      screen.getByText('Your passcode has been successfully verified.');
    });

    expect(client.otps?.whatsapp?.loginOrCreate).toHaveBeenCalledTimes(1);
    expect(client.otps?.whatsapp?.loginOrCreate).toHaveBeenCalledWith(MOCK_PHONE_E164, {
      expiration_minutes: config.otpOptions?.expirationMinutes,
    });
    expect(client.otps?.authenticate).toHaveBeenCalledTimes(1);
    expect(client.otps?.authenticate).toHaveBeenCalledWith(MOCK_OTP, MOCK_METHOD, {
      session_duration_minutes: config.sessionOptions?.sessionDurationMinutes,
    });
  });

  it('Successfully handles a email otp login', async () => {
    const config: MockConfig = {
      products: [Products.otp],
      sessionOptions: {
        sessionDurationMinutes: 60,
      },
      otpOptions: {
        expirationMinutes: 10,
        methods: [OTPMethods.Email],
      },
    };

    const client: MockClient = {
      otps: {
        authenticate: jest.fn().mockResolvedValue(void 0),
        email: {
          loginOrCreate: jest.fn().mockResolvedValue({ method_id: MOCK_METHOD }),
        },
      },
    };

    renderAppWithConfig(config, undefined, client);

    await userEvent.type(screen.getByPlaceholderText('example@email.com'), MOCK_EMAIL);

    await userEvent.click(screen.getByRole('button', { name: 'Continue with email' }));

    await waitFor(async () => {
      screen.getByText('Enter passcode');
    });

    await userEvent.type(screen.getByLabelText('One-time passcode'), MOCK_OTP);

    await waitFor(async () => {
      screen.getByText('Your passcode has been successfully verified.');
    });
    expect(client.otps?.email?.loginOrCreate).toHaveBeenCalledTimes(1);
    expect(client.otps?.email?.loginOrCreate).toHaveBeenCalledWith(MOCK_EMAIL, {
      expiration_minutes: config.otpOptions?.expirationMinutes,
    });
    expect(client.otps?.authenticate).toHaveBeenCalledTimes(1);
    expect(client.otps?.authenticate).toHaveBeenCalledWith(MOCK_OTP, MOCK_METHOD, {
      session_duration_minutes: config.sessionOptions?.sessionDurationMinutes,
    });
  });

  it('Successfully handles an error thrown while sending an OTP', async () => {
    const config: MockConfig = {
      products: [Products.otp],
      sessionOptions: {
        sessionDurationMinutes: 60,
      },
      otpOptions: {
        expirationMinutes: 10,
        methods: [OTPMethods.SMS],
      },
    };

    const client: MockClient = {
      otps: {
        authenticate: jest.fn().mockResolvedValue(void 0),
        sms: {
          loginOrCreate: jest.fn().mockRejectedValue(
            new StytchAPIError({
              error_message: "Couldn't send SMS",
              error_type: 'test_error',
              status_code: 400,
              error_url: 'https://stytch.com/dashboard/sdk-configuration',
            }),
          ),
        },
      },
    };

    renderAppWithConfig(config, undefined, client);

    await userEvent.type(screen.getByPlaceholderText('(201) 555-0123'), MOCK_PHONE);

    await waitFor(async () => {
      screen.getByText('Continue with text message');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Continue with text message' }));

    await waitFor(async () => {
      const errorElem = screen.getByText("Couldn't send SMS");
      expect(errorElem).toBeDefined();
    });

    expect(client.otps?.sms?.loginOrCreate).toHaveBeenCalledTimes(1);
    expect(client.otps?.sms?.loginOrCreate).toHaveBeenCalledWith(MOCK_PHONE_E164, {
      expiration_minutes: config.otpOptions?.expirationMinutes,
    });
  });

  it('Successfully handles an error thrown while authenticating an OTP', async () => {
    const config: MockConfig = {
      products: [Products.otp],
      sessionOptions: {
        sessionDurationMinutes: 60,
      },
      otpOptions: {
        expirationMinutes: 10,
        methods: [OTPMethods.SMS],
      },
    };

    const client: MockClient = {
      otps: {
        authenticate: jest.fn().mockRejectedValue(new Error("Couldn't verify phone number")),
        sms: {
          loginOrCreate: jest.fn().mockResolvedValue({ method_id: MOCK_METHOD }),
        },
      },
    };

    renderAppWithConfig(config, undefined, client);

    await userEvent.type(screen.getByPlaceholderText('(201) 555-0123'), MOCK_PHONE);

    await waitFor(async () => {
      screen.getByText('Continue with text message');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Continue with text message' }));

    await waitFor(async () => {
      screen.getByText('Enter passcode');
    });

    await userEvent.type(screen.getByLabelText('One-time passcode'), MOCK_OTP);

    expect(client.otps?.sms?.loginOrCreate).toHaveBeenCalledTimes(1);
    expect(client.otps?.sms?.loginOrCreate).toHaveBeenCalledWith(MOCK_PHONE_E164, {
      expiration_minutes: config.otpOptions?.expirationMinutes,
    });
    expect(client.otps?.authenticate).toHaveBeenCalledTimes(1);
    expect(client.otps?.authenticate).toHaveBeenCalledWith(MOCK_OTP, MOCK_METHOD, {
      session_duration_minutes: config.sessionOptions?.sessionDurationMinutes,
    });
  });

  it('Successfully handles resending the OTP', async () => {
    const config: MockConfig = {
      products: [Products.otp],
      sessionOptions: {
        sessionDurationMinutes: 60,
      },
      otpOptions: {
        expirationMinutes: 10,
        methods: [OTPMethods.SMS],
      },
    };

    const client: MockClient = {
      otps: {
        authenticate: jest.fn().mockResolvedValue(void 0),
        sms: {
          loginOrCreate: jest.fn().mockResolvedValue({ method_id: MOCK_METHOD }),
        },
      },
    };

    renderAppWithConfig(config, undefined, client);

    await userEvent.type(screen.getByPlaceholderText('(201) 555-0123'), MOCK_PHONE);

    await waitFor(async () => {
      screen.getByText('Continue with text message');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Continue with text message' }));

    await waitFor(async () => {
      screen.getByText('Enter passcode');
    });

    const currentTime = screen.getByText('Your code expires in 10:00.');
    expect(currentTime).toBeDefined();

    await act(() => new Promise((res) => setTimeout(res, 3500)));

    await waitFor(async () => {
      screen.getByText('Your code expires in 9:57.');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Resend code' }));

    await waitFor(async () => {
      const newCurrentTime = screen.getByText('Your code expires in 10:00.');

      expect(newCurrentTime).toBeDefined();
    });

    expect(client.otps?.sms?.loginOrCreate).toHaveBeenCalledTimes(2);
    expect(client.otps?.sms?.loginOrCreate).toHaveBeenNthCalledWith(1, MOCK_PHONE_E164, {
      expiration_minutes: config.otpOptions?.expirationMinutes,
    });
    expect(client.otps?.sms?.loginOrCreate).toHaveBeenNthCalledWith(2, MOCK_PHONE_E164, {
      expiration_minutes: config.otpOptions?.expirationMinutes,
    });
  });
});
