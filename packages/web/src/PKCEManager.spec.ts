import { PKCEManager } from './PKCEManager';
import { ConsumerSubscriptionDataLayer } from './SubscriptionService';

// jest.setup.js mocks out crypto.getRandomValues to ensure these stay in sync
const MOCK_VERIFIER = '00000000000000000000000000000000';
const MOCK_CHALLENGE = 'hODA6vqpWjTCk_J4rFLkXOU3urXnUqAOaVmhOuEDtlo';

const MOCK_KEYPAIR = {
  code_challenge: MOCK_CHALLENGE,
  code_verifier: MOCK_VERIFIER,
};

// jest.setup.js mocks out crypto.getRandomValues to ensure these stay in sync

describe('PKCEManager', () => {
  const dataLayer = new ConsumerSubscriptionDataLayer('mock-token');
  const manager = new PKCEManager(dataLayer, 'test');

  it('Manages the lifecycle of a PKCE transaction', async () => {
    expect(manager.getPKPair()).toBeUndefined();
    const keyPair = await manager.startPKCETransaction();
    expect(keyPair).toEqual(MOCK_KEYPAIR);
    expect(manager.getPKPair()).toEqual(MOCK_KEYPAIR);
    manager.clearPKPair();
    expect(manager.getPKPair()).toBeUndefined();
  });

  it('Multiple PKCE managers can exist without affecting each other', async () => {
    const other = new PKCEManager(dataLayer, 'other');
    expect(manager.getPKPair()).toBeUndefined();
    expect(other.getPKPair()).toBeUndefined();

    await manager.startPKCETransaction();

    expect(manager.getPKPair()).toEqual(MOCK_KEYPAIR);
    expect(other.getPKPair()).toBeUndefined();
  });

  describe('createProofkeyPair', () => {
    it('Creates a code challenge and code verifier', async () => {
      const { code_challenge, code_verifier } = await PKCEManager.createProofkeyPair();
      expect(code_verifier).toEqual(MOCK_VERIFIER);
      expect(code_challenge).toEqual(MOCK_CHALLENGE);
    });
  });
});
