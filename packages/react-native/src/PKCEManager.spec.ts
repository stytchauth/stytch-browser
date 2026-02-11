import { IAsyncPKCEManager, ProofkeyPair } from '@stytch/core';
import { when } from 'jest-when';

import { PKCEManager } from './PKCEManager';
import { MOCK_STORAGE_CLIENT } from './testUtils';

const generateCodeChallengeMock = jest.fn();
jest.mock('./native-module', function () {
  return {
    __esModule: true,
    default: class {
      PKCE = {
        generateCodeChallenge: generateCodeChallengeMock,
      };
    },
  };
});

describe('PKCEManager', () => {
  let manager: IAsyncPKCEManager;

  beforeAll(() => {
    manager = new PKCEManager(MOCK_STORAGE_CLIENT);
  });

  describe('PKCEManager.startPKCETransaction', () => {
    it('delegates to the StorageClient', async () => {
      generateCodeChallengeMock.mockReturnValueOnce({ code_challenge: '', code_verifier: '' });
      const result = await manager.startPKCETransaction();
      expect(MOCK_STORAGE_CLIENT.setData).toHaveBeenCalledWith('code_challenge', expect.anything());
      expect(MOCK_STORAGE_CLIENT.setData).toHaveBeenCalledWith('code_verifier', expect.anything());
      expect(result.code_challenge).toBeDefined();
      expect(result.code_verifier).toBeDefined();
    });
  });

  describe('PKCEManager.getPKPair', () => {
    it('delegates to the StorageClient', async () => {
      await manager.getPKPair();
      expect(MOCK_STORAGE_CLIENT.getData).toHaveBeenCalledWith('code_challenge');
      expect(MOCK_STORAGE_CLIENT.getData).toHaveBeenCalledWith('code_verifier');
    });

    describe('When code_challenge is null', () => {
      it('returns undefined', async () => {
        when(MOCK_STORAGE_CLIENT.getData).calledWith('code_challenge').mockReturnValueOnce(null);
        when(MOCK_STORAGE_CLIENT.getData).calledWith('code_verifier').mockReturnValueOnce('code_verifier_string');
        const result = await manager.getPKPair();
        expect(result).toBeUndefined();
      });
    });

    describe('When code_verifier is null', () => {
      it('returns undefined', async () => {
        when(MOCK_STORAGE_CLIENT.getData).calledWith('code_challenge').mockReturnValueOnce('code_challenge_string');
        when(MOCK_STORAGE_CLIENT.getData).calledWith('code_verifier').mockReturnValueOnce(null);
        const result = await manager.getPKPair();
        expect(result).toBeUndefined();
      });
    });

    describe(`When an error is encountered getting the code_challenge or code_verifier`, () => {
      it('returns undefined', async () => {
        when(MOCK_STORAGE_CLIENT.getData).calledWith('code_challenge').mockReturnValueOnce('code_challenge_string');
        when(MOCK_STORAGE_CLIENT.getData)
          .calledWith('code_verifier')
          .mockImplementation(() => {
            throw new Error();
          });
        let result = await manager.getPKPair();
        expect(result).toBeUndefined();

        when(MOCK_STORAGE_CLIENT.getData)
          .calledWith('code_challenge')
          .mockImplementation(() => {
            throw new Error();
          });
        when(MOCK_STORAGE_CLIENT.getData).calledWith('code_verifier').mockReturnValueOnce('code_verifier_string');
        result = await manager.getPKPair();
        expect(result).toBeUndefined();
      });
    });

    describe('When code_verifier and code_challenge are present', () => {
      it('returns a ProofkeyPair', async () => {
        when(MOCK_STORAGE_CLIENT.getData).calledWith('code_challenge').mockReturnValueOnce('code_challenge_string');
        when(MOCK_STORAGE_CLIENT.getData).calledWith('code_verifier').mockReturnValueOnce('code_verifier_string');
        const result = await manager.getPKPair();
        expect(result).toStrictEqual<ProofkeyPair>({
          code_challenge: 'code_challenge_string',
          code_verifier: 'code_verifier_string',
        });
      });
    });
  });

  describe('PKCEManager.clearPKPair', () => {
    it('delegates to the StorageClient', async () => {
      await manager.clearPKPair();
      expect(MOCK_STORAGE_CLIENT.clearData).toHaveBeenCalledWith('code_challenge');
      expect(MOCK_STORAGE_CLIENT.clearData).toHaveBeenCalledWith('code_verifier');
    });
  });
});
