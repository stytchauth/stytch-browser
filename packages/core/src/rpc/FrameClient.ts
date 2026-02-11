import { ErrorMarshaller } from '../ErrorMarshaller';
import { MULTIPLE_STYTCH_CLIENTS_DETECTED_WARNING } from '../constants';
import { logger } from '../utils';

type RequestPayload = {
  method: string;
  args: unknown[];
};

type ResponsePayload<T> = {
  success: boolean;
  payload: T;
  error: Record<string, unknown>;
};

export class IframeHostClient {
  frame!: Promise<HTMLIFrameElement>;

  constructor(private iframeURL: string) {
    this.createIframe();
  }

  private createIframe() {
    let existingIframe = document.querySelector(`[src~="${this.iframeURL}"]`) as HTMLIFrameElement;

    /* If an iframe does not exist yet, create one */
    if (!existingIframe) {
      existingIframe = document.createElement('iframe');
      existingIframe.src = this.iframeURL;
      existingIframe.style.position = 'absolute';
      existingIframe.style.width = '0';
      existingIframe.style.height = '0';
      existingIframe.style.border = '0';
      document.body.appendChild(existingIframe);
    } else {
      logger.warn(MULTIPLE_STYTCH_CLIENTS_DETECTED_WARNING);
    }

    /**
     * [NASTY BUG]
     * If we postMessage to an iframe that is _not yet loaded_, chrome will give a cryptic error message
     * Failed to execute 'postMessage' on 'DOMWindow':
     *   The target origin provided ('https://js.stytch.com') does not match the recipient window's origin ('http://localhost:3000').
     * There is no builtin way to determine if an iframe is already loaded,
     * so we set a dataset attr in our onload handler and use that to determine loading state
     */
    if (existingIframe.dataset.loaded === 'true') {
      this.frame = Promise.resolve(existingIframe);
      return;
    }

    this.frame = new Promise((resolve) => {
      existingIframe.addEventListener(
        'load',
        () => {
          existingIframe.dataset.loaded = 'true';
          resolve(existingIframe);
        },
        { once: true },
      );
    });
  }

  async call<T>(method: string, args: unknown[]): Promise<T> {
    const frame = await this.frame;
    const channel = new MessageChannel();

    return new Promise((resolve, reject) => {
      channel.port1.onmessage = (event) => {
        const resp = event.data as ResponsePayload<T>;
        channel.port1.close();
        if (resp.success) {
          resolve(resp.payload);
        } else {
          reject(ErrorMarshaller.unmarshall(resp.error));
        }
      };

      const message: RequestPayload = {
        method,
        args,
      };

      frame.contentWindow?.postMessage(message, this.iframeURL, [channel.port2]);
    });
  }
}
