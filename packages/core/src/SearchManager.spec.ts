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
});
