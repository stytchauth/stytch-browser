import { IAsyncPKCEManager, IStorageClient, ProofkeyPair, logger } from '@stytch/core';
import StytchReactNativeModule from './native-module';

export class PKCEManager implements IAsyncPKCEManager {
  private nativeModule: StytchReactNativeModule;

  constructor(private _storageClient: IStorageClient) {
    this.nativeModule = new StytchReactNativeModule();
  }

  async startPKCETransaction(): Promise<ProofkeyPair> {
    const keyPair = await this.nativeModule.PKCE.generateCodeChallenge();
    await this._storageClient.setData('code_challenge', keyPair.code_challenge);
    await this._storageClient.setData('code_verifier', keyPair.code_verifier);
    return keyPair;
  }

  async getPKPair(): Promise<ProofkeyPair | undefined> {
    try {
      const code_challenge = await this._storageClient.getData('code_challenge');
      const code_verifier = await this._storageClient.getData('code_verifier');
      if (code_challenge === null || code_verifier === null) {
        return undefined;
      }
      const proofkeyPair = { code_challenge, code_verifier };
      return proofkeyPair;
    } catch {
      logger.warn('Found malformed Proof Key pair in localstorage.');
      return undefined;
    }
  }

  async clearPKPair(): Promise<void> {
    await this._storageClient.clearData('code_challenge');
    await this._storageClient.clearData('code_verifier');
  }
}
