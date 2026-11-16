import { SearchDataManager } from './SearchManager';
import { createTestFixtures } from './testing';

const MOCK_SEARCH_RESPONSE = { userType: 'new' };
const MOCK_EMAIL = 'hello@example.com';

describe('searchDataManager', () => {
  const { networkClient, dfpProtectedAuth } = createTestFixtures();

  beforeEach(() => {
    localStorage.clear();
    networkClient.fetchSDK.mockResolvedValue(MOCK_SEARCH_RESPONSE);
  });

  it('is able to search for an email', async () => {
    const searchDataManager = new SearchDataManager(networkClient, dfpProtectedAuth);
    await expect(searchDataManager.searchUser(MOCK_EMAIL)).resolves.toEqual(MOCK_SEARCH_RESPONSE);

    expect(networkClient.fetchSDK).toHaveBeenCalledWith({
      url: `/users/search`,
      method: 'POST',
      body: { email: MOCK_EMAIL, captcha_token: 'mock-captcha-token' },
    });
  });

  it('sends the FRE telemetry ID with the search when there is one', async () => {
    const searchDataManager = new SearchDataManager(networkClient, {
      ...dfpProtectedAuth,
      getDFPTelemetryIDAndCaptcha: async () => ({ dfp_telemetry_id: 'dfp-id', fre_telemetry_id: 'fre-id' }),
    });
    await searchDataManager.searchUser(MOCK_EMAIL);

    expect(networkClient.fetchSDK).toHaveBeenCalledWith({
      url: `/users/search`,
      method: 'POST',
      body: { email: MOCK_EMAIL, dfp_telemetry_id: 'dfp-id', fre_telemetry_id: 'fre-id' },
    });
  });
});
