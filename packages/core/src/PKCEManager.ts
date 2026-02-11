export type ProofkeyPair = {
  code_challenge: string;
  code_verifier: string;
};

export interface IPKCEManager {
  startPKCETransaction(): Promise<ProofkeyPair>;

  getPKPair(): AsyncGetPKPair | SyncGetPKPair;

  clearPKPair(): Promise<void> | void;
}

type AsyncGetPKPair = Promise<ProofkeyPair | undefined>;
type SyncGetPKPair = ProofkeyPair | undefined;

export interface IAsyncPKCEManager extends IPKCEManager {
  startPKCETransaction(): Promise<ProofkeyPair>;

  getPKPair(): AsyncGetPKPair;

  clearPKPair(): Promise<void>;
}

export interface ISyncPKCEManager extends IPKCEManager {
  startPKCETransaction(): Promise<ProofkeyPair>;

  getPKPair(): SyncGetPKPair;

  clearPKPair(): void;
}
