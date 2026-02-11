/**
 * @jest-environment node
 */

import React from 'react';
import * as ReactDOMServer from 'react-dom/server';

import { StytchProvider } from '.';

const mockStytchClient = { isSSRStub: true } as any;

describe('StytchContext', () => {
  it('Renders nothing initially - and in SSR environments', async () => {
    expect(ReactDOMServer.renderToString(<StytchProvider stytch={mockStytchClient} />)).toMatchInlineSnapshot(`""`);
  });
});
