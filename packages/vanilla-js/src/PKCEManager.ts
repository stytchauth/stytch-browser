import { ISyncPKCEManager, ProofkeyPair } from '@stytch/core';
import { B2BSubscriptionDataLayer, ConsumerSubscriptionDataLayer } from './SubscriptionService';
import { logger } from '@stytch/core';

const PKCE_VERIFIER_STORAGE_KEY = 'PKCE_VERIFIER' as const;

function toHex(n: number): string {
  let str = n.toString(16);
  if (str.length === 1) {
    str = '0' + str;
  }
  return str;
}

function base64URLEncode(buf: ArrayBuffer) {
  // Convert the ArrayBuffer to string using Uint8 array.
  // btoa takes chars from 0-255 and base64 encodes.
  // Then convert the base64 encoded to base64url encoded.
  // (replace + with -, replace / with _, trim trailing =)
  return btoa(String.fromCharCode.call(null, ...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export class PKCEManager implements ISyncPKCEManager {
  constructor(
    private _dataLayer: ConsumerSubscriptionDataLayer | B2BSubscriptionDataLayer,
    private namespace: string,
  ) {}

  private key() {
    return `${PKCE_VERIFIER_STORAGE_KEY}:${this.namespace}` as const;
  }

  async startPKCETransaction(): Promise<ProofkeyPair> {
    const keyPair = await PKCEManager.createProofkeyPair();
    this._dataLayer.setItem(this.key(), JSON.stringify(keyPair));
    return keyPair;
  }

  getPKPair(): ProofkeyPair | undefined {
    const serialized = this._dataLayer.getItem(this.key());
    if (serialized === null) {
      return undefined;
    }
    try {
      return JSON.parse(serialized) as ProofkeyPair;
    } catch {
      logger.warn('Found malformed Proof Key pair in localstorage.');
      return undefined;
    }
  }

  clearPKPair(): void {
    return this._dataLayer.removeItem(this.key());
  }

  static async createProofkeyPair(): Promise<ProofkeyPair> {
    const bytes = new Uint32Array(16);
    window.crypto.getRandomValues(bytes);
    const codeVerifier = Array.from(bytes).map(toHex).join('');

    const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));

    return {
      code_challenge: base64URLEncode(digest),
      code_verifier: codeVerifier,
    };
  }
}
