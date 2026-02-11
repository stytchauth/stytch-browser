import { MOCK_CAPTCHA, MOCK_DFP_TELEMTRY_ID } from '@stytch/internal-mocks';
import { DFPProtectedAuthMode, DFPProtectedAuthProvider } from './DFPProtectedAuthProvider';
import { RetriableError, RetriableErrorType } from './NetworkClient';
import * as util from './utils';
import { BootstrapData } from './types';

describe('DFPProtectedAuthProvider', () => {
  const bootstrapManager = (dfpProtectedAuthEnabled: boolean, mode?: DFPProtectedAuthMode) => {
    const bootstrapData: BootstrapData = {
      projectName: 'test-project',
      displayWatermark: false,
      cnameDomain: 'cname.domain.com',
      emailDomains: ['test.com'],
      captchaSettings: { enabled: true, siteKey: 'site-key' },
      pkceRequiredForEmailMagicLinks: true,
      pkceRequiredForPasswordResets: true,
      pkceRequiredForOAuth: true,
      pkceRequiredForSso: false,
      slugPattern: null,
      createOrganizationEnabled: false,
      passwordConfig: null,
      runDFPProtectedAuth: dfpProtectedAuthEnabled,
      dfpProtectedAuthMode: mode,
      rbacPolicy: null,
      siweRequiredForCryptoWallets: false,
      vertical: null,
    };
    return {
      getAsync: () => Promise.resolve(bootstrapData),
      getSync: () => bootstrapData,
    };
  };

  afterEach(() => {
    loadedModuled.mockClear();
  });

  const loadedModuled = jest.spyOn(util, 'loadESModule');
  loadedModuled.mockResolvedValue(() => {
    (window as any).GetTelemetryID = jest.fn().mockResolvedValue('dfp-telemetry-id-123');
  });

  it('If DFP Protected Auth is enabled, it should load telemetry.js', async () => {
    const dfpProvider = new DFPProtectedAuthProvider(
      'public-token',
      'https://example.com',
      'https://dfp-cdn.example.com',
      bootstrapManager(true, 'OBSERVATION').getAsync(),
    );
    expect(await dfpProvider.isEnabled()).toBe(true);
    expect(loadedModuled).toHaveBeenCalled();
  });

  it(`If DFP Protected Auth is not enabled, it shouldn't load telemetry.js`, async () => {
    const dfpProvider = new DFPProtectedAuthProvider(
      'public-token',
      'https://example.com',
      'https://dfp-cdn.example.com',
      bootstrapManager(false).getAsync(),
    );
    expect(await dfpProvider.isEnabled()).toBe(false);
    expect(loadedModuled).toHaveBeenCalledTimes(0);
    expect(await dfpProvider.getTelemetryID()).toBe(undefined);
  });

  it('should return the use the correct public token and dfp backend url for submit', async () => {
    const getTelemetryID = jest.fn().mockResolvedValue('dfp-telemetry-id-123');
    const windowSpy = jest.spyOn(window as any, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      GetTelemetryID: getTelemetryID,
    }));

    const dfpProvider = new DFPProtectedAuthProvider(
      'public-token',
      'https://example.com',
      'https://dfp-cdn.example.com',
      bootstrapManager(true, 'OBSERVATION').getAsync(),
    );
    expect(await dfpProvider.getTelemetryID()).toBe('dfp-telemetry-id-123');
    expect(getTelemetryID).toHaveBeenCalledWith('public-token', 'https://example.com/submit');
  });

  it('should get a dfp telemetry id if enabled and in decisioning mode', async () => {
    const dfpProvider = new DFPProtectedAuthProvider(
      'public-token',
      'https://example.com',
      'https://dfp-cdn.example.com',
      bootstrapManager(true, 'DECISIONING').getAsync(),
      () => Promise.resolve(MOCK_CAPTCHA),
    );
    const { dfp_telemetry_id, captcha_token } = await dfpProvider.getDFPTelemetryIDAndCaptcha();
    expect(dfp_telemetry_id).toBe(MOCK_DFP_TELEMTRY_ID);
    expect(captcha_token).toBe(undefined);
  });

  it('should get a dfp telemetry id and captcha token if enabled and in observation mode', async () => {
    const dfpProvider = new DFPProtectedAuthProvider(
      'public-token',
      'https://example.com',
      'https://dfp-cdn.example.com',
      bootstrapManager(true, 'OBSERVATION').getAsync(),
      () => Promise.resolve(MOCK_CAPTCHA),
    );
    const { dfp_telemetry_id, captcha_token } = await dfpProvider.getDFPTelemetryIDAndCaptcha();
    expect(dfp_telemetry_id).toBe(MOCK_DFP_TELEMTRY_ID);
    expect(captcha_token).toBe(MOCK_CAPTCHA);
  });

  it('should get a captcha if dfp protected auth is disabled', async () => {
    const dfpProvider = new DFPProtectedAuthProvider(
      'public-token',
      'https://example.com',
      'https://dfp-cdn.example.com',
      bootstrapManager(false).getAsync(),
      () => Promise.resolve(MOCK_CAPTCHA),
    );
    const { dfp_telemetry_id, captcha_token } = await dfpProvider.getDFPTelemetryIDAndCaptcha();
    expect(dfp_telemetry_id).toBe(undefined);
    expect(captcha_token).toBe(MOCK_CAPTCHA);
  });

  it('should return nothing if neither are configured', async () => {
    const dfpProvider = new DFPProtectedAuthProvider(
      'public-token',
      'https://example.com',
      'https://dfp-cdn.example.com',
      bootstrapManager(false).getAsync(),
      () => Promise.resolve(undefined),
    );
    const { dfp_telemetry_id, captcha_token } = await dfpProvider.getDFPTelemetryIDAndCaptcha();
    expect(dfp_telemetry_id).toBe(undefined);
    expect(captcha_token).toBe(undefined);
  });

  it('should return both captcha and dfp telemetry ID if both are configured', async () => {
    const dfpProvider = new DFPProtectedAuthProvider(
      'public-token',
      'https://example.com',
      'https://dfp-cdn.example.com',
      bootstrapManager(true).getAsync(),
      () => Promise.resolve(MOCK_CAPTCHA),
    );
    let req = { body: {} } as any;

    req = await dfpProvider.retryWithCaptchaAndDFP(new RetriableError(RetriableErrorType.RequiredCaptcha), req);
    expect(req.body.dfp_telemetry_id).toBe(MOCK_DFP_TELEMTRY_ID);
    expect(req.body.captcha_token).toBe(MOCK_CAPTCHA);
  });
});
