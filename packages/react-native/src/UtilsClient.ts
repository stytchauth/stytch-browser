import { IAsyncPKCEManager, ProofkeyPair } from '@stytch/core';

export interface IUtilsClient {
  getPKCEPair(): Promise<ProofkeyPair | undefined>;
}

export class UtilsClient implements IUtilsClient {
  constructor(private pkceManager: IAsyncPKCEManager) {}

  async getPKCEPair(): Promise<ProofkeyPair | undefined> {
    return this.pkceManager.getPKPair();
  }
}
