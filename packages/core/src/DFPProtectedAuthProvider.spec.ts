import { MOCK_CAPTCHA, MOCK_DFP_TELEMTRY_ID } from '@stytch/internal-mocks';

import { DFPProtectedAuthMode, DFPProtectedAuthProvider } from './DFPProtectedAuthProvider';
import { RetriableError, RetriableErrorType } from './NetworkClient';
import { BootstrapData } from './types';
import * as util from './utils';

describe('DFPProtectedAuthProvider', () => {
  const bootstrapManager = (dfpProtectedAuthEnabled: boolean, mode?: DFPProtectedAuthMode, freEnabled = false) => {
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
      runFREProtectedAuth: freEnabled,
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
  // Like the real loader, resolve with whatever GetTelemetryID is on the window when the script "loads"
  loadedModuled.mockImplementation(async () => window.GetTelemetryID);

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
    window.GetTelemetryID = getTelemetryID;

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
  describe('FRE telemetry.js', () => {
    it('loads the FRE script after the DFP script when FRE is enabled and a domain is set', async () => {
      const events: string[] = [];
      loadedModuled.mockImplementation(async (url: string) => {
        events.push(`start ${url}`);
        await Promise.resolve();
        events.push(`end ${url}`);
        return jest.fn();
      });
      const dfpProvider = new DFPProtectedAuthProvider(
        'public-token',
        'https://example.com',
        'https://dfp-cdn.example.com',
        bootstrapManager(true, 'OBSERVATION', true).getAsync(),
        undefined,
        'https://fre.example.com',
      );
      await dfpProvider.isEnabled();
      expect(events).toEqual([
        'start https://dfp-cdn.example.com/telemetry.js',
        'end https://dfp-cdn.example.com/telemetry.js',
        'start https://fre.example.com/telemetry.js',
        'end https://fre.example.com/telemetry.js',
      ]);
    });

    it.each([
      ['FRE is not enabled in bootstrap', false, 'https://fre.example.com'],
      ['no FRE domain is set', true, undefined],
      ['the FRE domain is empty', true, ''],
    ])('does not load the FRE script when %s', async (_name, freEnabled, freDomainURL) => {
      const dfpProvider = new DFPProtectedAuthProvider(
        'public-token',
        'https://example.com',
        'https://dfp-cdn.example.com',
        bootstrapManager(true, 'OBSERVATION', freEnabled).getAsync(),
        undefined,
        freDomainURL,
      );
      await dfpProvider.isEnabled();
      expect(loadedModuled).toHaveBeenCalledTimes(1);
      expect(loadedModuled).toHaveBeenCalledWith('https://dfp-cdn.example.com/telemetry.js', expect.any(Function));
    });
  });
});
