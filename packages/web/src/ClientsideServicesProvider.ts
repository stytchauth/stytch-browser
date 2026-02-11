import { IframeHostClient, RPCManifest } from '@stytch/core';

export class ClientsideServicesProvider implements RPCManifest {
  private _frameClient: IframeHostClient | undefined;
  constructor(private iframeURL: string) {}

  /**
   * The frameClient is lazily initialized - we don't want to force users
   * that don't use any of its features to still download the bundle!
   * @private
   */
  private get frameClient(): IframeHostClient {
    this._frameClient = this._frameClient ?? new IframeHostClient(this.iframeURL);
    return this._frameClient;
  }

  private call<T, U>(handlerName: string, req: T): Promise<U> {
    return this.frameClient.call<U>(handlerName, [req]);
  }

  oneTapStart: RPCManifest['oneTapStart'] = (req) => this.call('oneTapStart', req);
  oneTapSubmit: RPCManifest['oneTapSubmit'] = (req) => this.call('oneTapSubmit', req);
  parsedPhoneNumber: RPCManifest['parsedPhoneNumber'] = (req) => this.call('parsedPhoneNumber', req);
  getExamplePhoneNumber: RPCManifest['getExamplePhoneNumber'] = (req) => this.call('getExamplePhoneNumber', req);
}
