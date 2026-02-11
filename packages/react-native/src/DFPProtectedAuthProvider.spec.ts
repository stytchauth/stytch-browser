import { DFPProtectedAuthProvider } from './DFPProtectedAuthProvider';

const getTelemetryIdMock = jest.fn();
const configureDfpMock = jest.fn();

jest.mock('./native-module', function () {
  return {
    __esModule: true,
    default: class {
      Misc = {
        getTelemetryId: getTelemetryIdMock,
        configureDfp: configureDfpMock,
      };
    },
  };
});

describe('DFPProtectedAuthProvider', () => {
  const bootstrapManager = (dfpProtectedAuthEnabled: boolean) => {
    const bootstrapData = {
      projectName: 'Test Project',
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
      rbacPolicy: null,
      siweRequiredForCryptoWallets: false,
      vertical: null,
    };
    return {
      getAsync: () => Promise.resolve(bootstrapData),
      getSync: () => bootstrapData,
    };
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('If DFP Protected Auth is enabled, provider should be enabled', async () => {
    const dfpProvider = new DFPProtectedAuthProvider(
      'public-token',
      'https://example.com',
      bootstrapManager(true).getAsync(),
    );
    expect(await dfpProvider.isEnabled()).toBe(true);
  });

  it(`If DFP Protected Auth is not enabled, provider shouldn't be enabled`, async () => {
    const dfpProvider = new DFPProtectedAuthProvider(
      'public-token',
      'https://example.com',
      bootstrapManager(false).getAsync(),
    );
    expect(await dfpProvider.isEnabled()).toBe(false);
  });

  it('should return the use the correct public token and dfp backend url for submit', async () => {
    getTelemetryIdMock.mockResolvedValueOnce({ telemetryId: 'dfp-telemetry-id-123' });

    const dfpProvider = new DFPProtectedAuthProvider(
      'public-token',
      'https://example.com',
      bootstrapManager(true).getAsync(),
    );
    expect(await dfpProvider.getTelemetryID()).toBe('dfp-telemetry-id-123');
    expect(getTelemetryIdMock).toHaveBeenCalledWith();
  });
});
