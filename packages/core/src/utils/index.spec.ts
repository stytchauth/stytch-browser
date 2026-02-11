import { isTestPublicToken, normalizePromiseLike } from './index';

describe('Utils', () => {
  describe('isTestPublicToken', () => {
    it('Returns true for a test public token', () => {
      expect(isTestPublicToken('public-token-test-0c532eeb-5088-4f3f-a33d-ebd4fda792b6')).toBeTruthy();
    });

    it('Returns false for a live public token', () => {
      expect(isTestPublicToken('public-token-live-ecb6a1b5-ce12-4291-aa38-acabf0565fa1')).toBeFalsy();
    });
  });
  describe('normalizePromiseLike', () => {
    it('Resolves a fulfilled PromiseLike', async () => {
      const promiseLike = {
        then: (resolve: (T: unknown) => void) => resolve('success'),
      } as PromiseLike<unknown>;

      await expect(normalizePromiseLike(promiseLike)).resolves.toEqual('success');
    });
    it('Rejects an rejected PromiseLike', async () => {
      const promiseLike = {
        then: (resolve: (T: unknown) => unknown, reject: (e: unknown) => unknown) => reject(new Error('Failed')),
      } as PromiseLike<unknown>;

      await expect(normalizePromiseLike(promiseLike)).rejects.toThrow(new Error('Failed'));
    });
  });
});
