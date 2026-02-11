import { marshallError } from './errors';
import { IframeEmbeddedClient } from './IframeClient';

describe('IframeEmbeddedClient', () => {
  const mockHandler = jest.fn();

  const embedded = new IframeEmbeddedClient();
  embedded.registerHandler('method', mockHandler);

  it('Invokes the handler when it receives a message and responds with the result', async () => {
    mockHandler.mockReturnValue('complete!');
    const responsePort = { postMessage: jest.fn() };

    const evt = new MessageEvent('message', {
      data: {
        method: 'method',
        args: ['prop', { other: 'prop' }],
      },
      ports: [responsePort as any],
    });

    window.dispatchEvent(evt);
    await new Promise((tick) => setInterval(tick, 0)); // Let v8 event loop run a few times

    expect(mockHandler).toHaveBeenCalledWith('prop', { other: 'prop' });

    expect(responsePort.postMessage).toHaveBeenCalledWith({
      success: true,
      payload: 'complete!',
    });
  });

  it('Responds with success: false on error', async () => {
    const err = new Error('It broke');
    mockHandler.mockRejectedValue(err);
    const responsePort = { postMessage: jest.fn() };

    const evt = new MessageEvent('message', {
      data: { method: 'method', args: [] },
      ports: [responsePort as any],
    });

    window.dispatchEvent(evt);
    await new Promise((tick) => setInterval(tick, 0)); // Let v8 event loop run a few times

    expect(responsePort.postMessage).toHaveBeenCalledWith({
      success: false,
      error: marshallError(err),
    });
  });
});
