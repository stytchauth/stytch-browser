import { marshallError } from './errors';

interface RequestPayload {
  method: string;
  args: unknown[];
}

export class IframeEmbeddedClient {
  handlers: Record<string, (...args: unknown[]) => Promise<unknown>>;

  constructor() {
    this.handlers = {};

    window.addEventListener('message', (event) => {
      this.runHandler(event);
    });
  }

  async runHandler(event: MessageEvent) {
    const req = event.data as RequestPayload;
    const port = event.ports[0];
    const handler = this.handlers[req.method];

    if (!handler || !port) {
      return;
    }

    try {
      const payload = await handler(...req.args);
      port.postMessage({ success: true, payload });
    } catch (error) {
      port.postMessage({
        success: false,
        error: marshallError(error as Error),
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerHandler(handler: string, handlerImpl: (...args: any[]) => Promise<unknown>): void {
    this.handlers[handler] = handlerImpl;
  }
}
