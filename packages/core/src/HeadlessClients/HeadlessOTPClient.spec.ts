import {
  MOCK_AUTHENTICATE_PAYLOAD,
  updateSessionExpect,
  MOCK_AUTHENTICATE_RETURN_VALUE,
  MOCK_CAPTCHA,
  MOCK_DFP_TELEMTRY_ID,
  MOCK_EMAIL,
  MOCK_METHOD_ID,
  MOCK_PHONE_NUMBER,
} from '@stytch/internal-mocks';
import {
  IConsumerSubscriptionServiceMock,
  INetworkClientMock,
  MockDFPProtectedAuthCaptchaOnly,
  MockDFPProtectedAuthDFPAndCaptcha,
  MockDFPProtectedAuthDFPOnly,
  createTestFixtures,
} from '../testing';
import { HeadlessOTPClient } from './HeadlessOTPClient';
import { StytchProjectConfiguration } from '../public';

describe('HeadlessOTPClient', () => {
  let networkClient: INetworkClientMock;
  let subscriptionService: IConsumerSubscriptionServiceMock;
  let captchaProvider: () => Promise<string>;

  let client: HeadlessOTPClient<StytchProjectConfiguration>;

  beforeEach(() => {
    jest.resetAllMocks();

    ({ networkClient, subscriptionService, captchaProvider } = createTestFixtures());

    client = new HeadlessOTPClient(
      networkClient,
      subscriptionService,
      captchaProvider,
      MockDFPProtectedAuthCaptchaOnly(),
    );
  });

  describe('loginOrCreate', () => {
    const otpOptions = {
      expiration_minutes: 10,
      locale: 'en',
    };

    const autofillOtpOptions = { ...otpOptions, enable_autofill: true };

    it('Calls the sms loginOrCreate method', async () => {
      await client.sms.loginOrCreate(MOCK_PHONE_NUMBER, otpOptions);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { expiration_minutes: 10, locale: 'en', phone_number: MOCK_PHONE_NUMBER, captcha_token: MOCK_CAPTCHA },
        method: 'POST',
        url: '/otps/sms/login_or_create',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the sms loginOrCreate method with enable_autofill', async () => {
      await client.sms.loginOrCreate(MOCK_PHONE_NUMBER, autofillOtpOptions);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          expiration_minutes: 10,
          phone_number: MOCK_PHONE_NUMBER,
          captcha_token: MOCK_CAPTCHA,
          enable_autofill: true,
          dfp_telemetry_id: undefined,
          locale: 'en',
        },
        method: 'POST',
        url: '/otps/sms/login_or_create',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the sms loginOrCreate method with dfp protected auth', async () => {
      const client = new HeadlessOTPClient(
        networkClient,
        subscriptionService,
        captchaProvider,
        MockDFPProtectedAuthDFPAndCaptcha(),
      );

      await client.sms.loginOrCreate(MOCK_PHONE_NUMBER, otpOptions);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          expiration_minutes: 10,
          locale: 'en',
          phone_number: MOCK_PHONE_NUMBER,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        method: 'POST',
        url: '/otps/sms/login_or_create',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the whatsapp loginOrCreate method', async () => {
      await client.whatsapp.loginOrCreate(MOCK_PHONE_NUMBER, otpOptions);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { expiration_minutes: 10, locale: 'en', phone_number: MOCK_PHONE_NUMBER, captcha_token: MOCK_CAPTCHA },
        method: 'POST',
        url: '/otps/whatsapp/login_or_create',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the whatsapp loginOrCreate method with dfp protected auth', async () => {
      const client = new HeadlessOTPClient(
        networkClient,
        subscriptionService,
        captchaProvider,
        MockDFPProtectedAuthDFPOnly(),
      );

      await client.whatsapp.loginOrCreate(MOCK_PHONE_NUMBER, otpOptions);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          expiration_minutes: 10,
          locale: 'en',
          phone_number: MOCK_PHONE_NUMBER,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        method: 'POST',
        url: '/otps/whatsapp/login_or_create',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the email loginOrCreate method', async () => {
      await client.email.loginOrCreate(MOCK_EMAIL, otpOptions);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { email: MOCK_EMAIL, locale: 'en', expiration_minutes: 10, captcha_token: MOCK_CAPTCHA },
        method: 'POST',
        url: '/otps/email/login_or_create',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the email loginOrCreate method with dfp protected auth', async () => {
      const client = new HeadlessOTPClient(
        networkClient,
        subscriptionService,
        captchaProvider,
        MockDFPProtectedAuthDFPOnly(),
      );

      await client.email.loginOrCreate(MOCK_EMAIL, otpOptions);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          expiration_minutes: 10,
          locale: 'en',
          email: MOCK_EMAIL,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        method: 'POST',
        url: '/otps/email/login_or_create',
        retryCallback: expect.any(Function),
      });
    });
  });

  describe('send as a primary factor', () => {
    const otpOptions = {
      expiration_minutes: 10,
      locale: 'en',
    };
    const autofillOtpOptions = { ...otpOptions, enable_autofill: true };

    it('Calls the sms send method', async () => {
      await client.sms.send(MOCK_PHONE_NUMBER, otpOptions);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { expiration_minutes: 10, locale: 'en', phone_number: MOCK_PHONE_NUMBER, captcha_token: MOCK_CAPTCHA },
        method: 'POST',
        url: '/otps/sms/send/primary',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the sms send method with enable_autofill', async () => {
      await client.sms.send(MOCK_PHONE_NUMBER, autofillOtpOptions);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          expiration_minutes: 10,
          phone_number: MOCK_PHONE_NUMBER,
          captcha_token: MOCK_CAPTCHA,
          enable_autofill: true,
          dfp_telemetry_id: undefined,
          locale: 'en',
        },
        method: 'POST',
        url: '/otps/sms/send/primary',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the sms send method with dfp protected auth', async () => {
      const client = new HeadlessOTPClient(
        networkClient,
        subscriptionService,
        captchaProvider,
        MockDFPProtectedAuthDFPAndCaptcha(),
      );

      await client.sms.send(MOCK_PHONE_NUMBER, otpOptions);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          expiration_minutes: 10,
          locale: 'en',
          phone_number: MOCK_PHONE_NUMBER,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        method: 'POST',
        url: '/otps/sms/send/primary',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the whatsapp send method', async () => {
      await client.whatsapp.send(MOCK_PHONE_NUMBER, otpOptions);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { expiration_minutes: 10, locale: 'en', phone_number: MOCK_PHONE_NUMBER, captcha_token: MOCK_CAPTCHA },
        method: 'POST',
        url: '/otps/whatsapp/send/primary',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the whatsapp send method with dfp protected auth', async () => {
      const client = new HeadlessOTPClient(
        networkClient,
        subscriptionService,
        captchaProvider,
        MockDFPProtectedAuthDFPOnly(),
      );

      await client.whatsapp.send(MOCK_PHONE_NUMBER, otpOptions);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          expiration_minutes: 10,
          locale: 'en',
          phone_number: MOCK_PHONE_NUMBER,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        method: 'POST',
        url: '/otps/whatsapp/send/primary',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the email send method', async () => {
      await client.email.send(MOCK_EMAIL, otpOptions);
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        body: { email: MOCK_EMAIL, expiration_minutes: 10, locale: 'en', captcha_token: MOCK_CAPTCHA },
        method: 'POST',
        url: '/otps/email/send/primary',
      });
    });
  });

  describe('send as a secondary factor', () => {
    const otpOptions = {
      expiration_minutes: 10,
      locale: 'en',
    };
    const autofillOtpOptions = { ...otpOptions, enable_autofill: true };

    it('Calls the sms send method', async () => {
      subscriptionService.getSession.mockReturnValue({ mock: 'session' });

      await client.sms.send(MOCK_PHONE_NUMBER, otpOptions);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { expiration_minutes: 10, locale: 'en', phone_number: MOCK_PHONE_NUMBER, captcha_token: MOCK_CAPTCHA },
        method: 'POST',
        url: '/otps/sms/send/secondary',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the sms send method with enable_autofill', async () => {
      subscriptionService.getSession.mockReturnValue({ mock: 'session' });
      await client.sms.send(MOCK_PHONE_NUMBER, autofillOtpOptions);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          expiration_minutes: 10,
          phone_number: MOCK_PHONE_NUMBER,
          captcha_token: MOCK_CAPTCHA,
          enable_autofill: true,
          dfp_telemetry_id: undefined,
          locale: 'en',
        },
        method: 'POST',
        url: '/otps/sms/send/secondary',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the sms send method with dfp protected auth', async () => {
      const client = new HeadlessOTPClient(
        networkClient,
        subscriptionService,
        captchaProvider,
        MockDFPProtectedAuthDFPOnly(),
      );

      subscriptionService.getSession.mockReturnValue({ mock: 'session' });

      await client.sms.send(MOCK_PHONE_NUMBER, otpOptions);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          expiration_minutes: 10,
          locale: 'en',
          phone_number: MOCK_PHONE_NUMBER,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        method: 'POST',
        url: '/otps/sms/send/secondary',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the whatsapp send method', async () => {
      subscriptionService.getSession.mockReturnValue({ mock: 'session' });
      await client.whatsapp.send(MOCK_PHONE_NUMBER, otpOptions);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { expiration_minutes: 10, locale: 'en', phone_number: MOCK_PHONE_NUMBER, captcha_token: MOCK_CAPTCHA },
        method: 'POST',
        url: '/otps/whatsapp/send/secondary',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the whatsapp send method with dfp protected auth', async () => {
      const client = new HeadlessOTPClient(
        networkClient,
        subscriptionService,
        captchaProvider,
        MockDFPProtectedAuthDFPOnly(),
      );

      subscriptionService.getSession.mockReturnValue({ mock: 'session' });
      await client.whatsapp.send(MOCK_PHONE_NUMBER, otpOptions);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          expiration_minutes: 10,
          locale: 'en',
          phone_number: MOCK_PHONE_NUMBER,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        method: 'POST',
        url: '/otps/whatsapp/send/secondary',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the email send method', async () => {
      subscriptionService.getSession.mockReturnValue({ mock: 'session' });
      await client.email.send(MOCK_EMAIL, otpOptions);
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        body: { email: MOCK_EMAIL, expiration_minutes: 10, locale: 'en', captcha_token: MOCK_CAPTCHA },
        method: 'POST',
        url: '/otps/email/send/secondary',
      });
    });
  });

  describe('authenticate', () => {
    it('Calls the authenticate method, stores some data in the subscriptionService, and returns a cleaned response', async () => {
      const token = '123456';
      const authenticateOptions = {
        session_duration_minutes: 10,
      };

      networkClient.retriableFetchSDK.mockReturnValue(MOCK_AUTHENTICATE_PAYLOAD);

      await expect(client.authenticate(token, MOCK_METHOD_ID, authenticateOptions)).resolves.toEqual(
        MOCK_AUTHENTICATE_RETURN_VALUE,
      );
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          method_id: MOCK_METHOD_ID,
          session_duration_minutes: 10,
          token,
          captcha_token: MOCK_CAPTCHA,
        },
        method: 'POST',
        url: '/otps/authenticate',
        retryCallback: expect.any(Function),
      });
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect());
    });
    it('Calls the authenticate method with DFP telementry ID', async () => {
      const token = '123456';
      const authenticateOptions = {
        session_duration_minutes: 10,
      };
      const client = new HeadlessOTPClient(
        networkClient,
        subscriptionService,
        captchaProvider,
        MockDFPProtectedAuthDFPAndCaptcha(),
      );

      networkClient.retriableFetchSDK.mockReturnValue(MOCK_AUTHENTICATE_PAYLOAD);

      await expect(client.authenticate(token, MOCK_METHOD_ID, authenticateOptions)).resolves.toEqual(
        MOCK_AUTHENTICATE_RETURN_VALUE,
      );
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          method_id: MOCK_METHOD_ID,
          session_duration_minutes: 10,
          token,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        method: 'POST',
        url: '/otps/authenticate',
        retryCallback: expect.any(Function),
      });
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect());
    });
  });
});
